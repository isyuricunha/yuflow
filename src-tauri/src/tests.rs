#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::*;
    use crate::database::Database;
    use tempfile::TempDir;
    use std::path::PathBuf;

    struct TestApp {
        _temp_dir: TempDir,
        app_dir: PathBuf,
    }

    impl TestApp {
        fn new() -> Self {
            let temp_dir = TempDir::new().expect("Failed to create temp dir");
            let app_dir = temp_dir.path().to_path_buf();
            
            TestApp {
                _temp_dir: temp_dir,
                app_dir,
            }
        }

        fn path(&self) -> MockPath {
            MockPath { app_dir: self.app_dir.clone() }
        }
    }

    struct MockPath {
        app_dir: PathBuf,
    }

    impl MockPath {
        fn app_data_dir(&self) -> Result<PathBuf, Box<dyn std::error::Error>> {
            Ok(self.app_dir.clone())
        }
    }

    async fn setup_test_database() -> (TestApp, Database) {
        let test_app = TestApp::new();
        
        // Create a mock database URL for testing
        let db_path = test_app.app_dir.join("test.db");
        let database_url = format!("sqlite:{}", db_path.display());
        
        let pool = sqlx::SqlitePool::connect(&database_url).await
            .expect("Failed to connect to test database");
        
        // Run migrations
        sqlx::migrate!("./migrations").run(&pool).await
            .expect("Failed to run migrations");
        
        let database = Database { pool };
        
        (test_app, database)
    }

    #[tokio::test]
    async fn test_create_and_get_task() {
        let (_app, db) = setup_test_database().await;
        
        let task_input = CreateTaskInput {
            title: "Test Task".to_string(),
            description: Some("Test Description".to_string()),
            priority: Some("high".to_string()),
            category_id: None,
            due_date: None,
        };

        // Test validation
        assert!(task_input.validate().is_ok());

        // Create task
        let created_task = db.create_task(task_input).await
            .expect("Failed to create task");
        
        assert_eq!(created_task.title, "Test Task");
        assert_eq!(created_task.description, Some("Test Description".to_string()));
        assert_eq!(created_task.priority, "high");
        assert!(!created_task.completed);

        // Get task
        let retrieved_task = db.get_task(created_task.id).await
            .expect("Failed to get task")
            .expect("Task not found");
        
        assert_eq!(retrieved_task.id, created_task.id);
        assert_eq!(retrieved_task.title, created_task.title);
    }

    #[tokio::test]
    async fn test_update_task() {
        let (_app, db) = setup_test_database().await;
        
        let task_input = CreateTaskInput {
            title: "Original Title".to_string(),
            description: None,
            priority: Some("low".to_string()),
            category_id: None,
            due_date: None,
        };

        let created_task = db.create_task(task_input).await
            .expect("Failed to create task");

        let update_input = UpdateTaskInput {
            id: created_task.id,
            title: Some("Updated Title".to_string()),
            description: Some("New Description".to_string()),
            completed: Some(true),
            priority: Some("high".to_string()),
            category_id: None,
            due_date: None,
        };

        let updated_task = db.update_task(update_input).await
            .expect("Failed to update task");

        assert_eq!(updated_task.title, "Updated Title");
        assert_eq!(updated_task.description, Some("New Description".to_string()));
        assert_eq!(updated_task.priority, "high");
        assert!(updated_task.completed);
    }

    #[tokio::test]
    async fn test_delete_task() {
        let (_app, db) = setup_test_database().await;
        
        let task_input = CreateTaskInput {
            title: "Task to Delete".to_string(),
            description: None,
            priority: Some("medium".to_string()),
            category_id: None,
            due_date: None,
        };

        let created_task = db.create_task(task_input).await
            .expect("Failed to create task");

        // Delete task
        db.delete_task(created_task.id).await
            .expect("Failed to delete task");

        // Verify task is deleted
        let retrieved_task = db.get_task(created_task.id).await
            .expect("Failed to query task");
        
        assert!(retrieved_task.is_none());
    }

    #[tokio::test]
    async fn test_create_and_get_category() {
        let (_app, db) = setup_test_database().await;
        
        let category_input = CreateCategoryInput {
            name: "Work".to_string(),
            color: Some("#FF5733".to_string()),
        };

        // Test validation
        assert!(category_input.validate().is_ok());

        let created_category = db.create_category(category_input).await
            .expect("Failed to create category");

        assert_eq!(created_category.name, "Work");
        assert_eq!(created_category.color, "#FF5733");

        // Get all categories
        let categories = db.get_categories().await
            .expect("Failed to get categories");
        
        assert!(categories.iter().any(|c| c.name == "Work"));
    }

    #[tokio::test]
    async fn test_task_filters() {
        let (_app, db) = setup_test_database().await;
        
        // Create test tasks
        let task1 = CreateTaskInput {
            title: "High Priority Task".to_string(),
            description: None,
            priority: Some("high".to_string()),
            category_id: None,
            due_date: None,
        };
        
        let task2 = CreateTaskInput {
            title: "Low Priority Task".to_string(),
            description: None,
            priority: Some("low".to_string()),
            category_id: None,
            due_date: None,
        };

        let created_task1 = db.create_task(task1).await.expect("Failed to create task1");
        let created_task2 = db.create_task(task2).await.expect("Failed to create task2");

        // Mark task1 as completed
        db.update_task(UpdateTaskInput {
            id: created_task1.id,
            title: None,
            description: None,
            completed: Some(true),
            priority: None,
            category_id: None,
            due_date: None,
        }).await.expect("Failed to update task1");

        // Test filter by completed status
        let completed_filter = TaskFilters {
            completed: Some(true),
            priority: None,
            category_id: None,
            search: None,
            due_date_before: None,
            due_date_after: None,
        };

        let completed_tasks = db.get_tasks(Some(completed_filter)).await
            .expect("Failed to get completed tasks");
        
        assert_eq!(completed_tasks.len(), 1);
        assert_eq!(completed_tasks[0].title, "High Priority Task");

        // Test filter by priority
        let priority_filter = TaskFilters {
            completed: None,
            priority: Some("low".to_string()),
            category_id: None,
            search: None,
            due_date_before: None,
            due_date_after: None,
        };

        let low_priority_tasks = db.get_tasks(Some(priority_filter)).await
            .expect("Failed to get low priority tasks");
        
        assert_eq!(low_priority_tasks.len(), 1);
        assert_eq!(low_priority_tasks[0].title, "Low Priority Task");
    }

    #[tokio::test]
    async fn test_settings() {
        let (_app, db) = setup_test_database().await;
        
        // Set a setting
        db.set_setting("theme", "dark").await
            .expect("Failed to set setting");

        // Get the setting
        let value = db.get_setting("theme").await
            .expect("Failed to get setting");
        
        assert_eq!(value, Some("dark".to_string()));

        // Get non-existent setting
        let missing = db.get_setting("nonexistent").await
            .expect("Failed to query missing setting");
        
        assert!(missing.is_none());

        // Update setting
        db.set_setting("theme", "light").await
            .expect("Failed to update setting");

        let updated_value = db.get_setting("theme").await
            .expect("Failed to get updated setting");
        
        assert_eq!(updated_value, Some("light".to_string()));
    }

    #[tokio::test]
    async fn test_validation_errors() {
        // Test invalid task title (empty)
        let invalid_task = CreateTaskInput {
            title: "".to_string(),
            description: None,
            priority: Some("high".to_string()),
            category_id: None,
            due_date: None,
        };

        assert!(invalid_task.validate().is_err());

        // Test invalid priority
        let invalid_priority = CreateTaskInput {
            title: "Valid Title".to_string(),
            description: None,
            priority: Some("invalid".to_string()),
            category_id: None,
            due_date: None,
        };

        assert!(invalid_priority.validate().is_err());

        // Test invalid category name (empty)
        let invalid_category = CreateCategoryInput {
            name: "".to_string(),
            color: Some("#FF5733".to_string()),
        };

        assert!(invalid_category.validate().is_err());

        // Test invalid color format
        let invalid_color = CreateCategoryInput {
            name: "Valid Name".to_string(),
            color: Some("invalid-color".to_string()),
        };

        assert!(invalid_color.validate().is_err());
    }

    #[tokio::test]
    async fn test_search_functionality() {
        let (_app, db) = setup_test_database().await;
        
        // Create test tasks
        let task1 = CreateTaskInput {
            title: "Learn Rust Programming".to_string(),
            description: Some("Study Rust language fundamentals".to_string()),
            priority: Some("high".to_string()),
            category_id: None,
            due_date: None,
        };
        
        let task2 = CreateTaskInput {
            title: "Buy Groceries".to_string(),
            description: Some("Milk, bread, and fruits".to_string()),
            priority: Some("medium".to_string()),
            category_id: None,
            due_date: None,
        };

        db.create_task(task1).await.expect("Failed to create task1");
        db.create_task(task2).await.expect("Failed to create task2");

        // Search by title
        let search_filter = TaskFilters {
            completed: None,
            priority: None,
            category_id: None,
            search: Some("Rust".to_string()),
            due_date_before: None,
            due_date_after: None,
        };

        let search_results = db.get_tasks(Some(search_filter)).await
            .expect("Failed to search tasks");
        
        assert_eq!(search_results.len(), 1);
        assert_eq!(search_results[0].title, "Learn Rust Programming");

        // Search by description
        let desc_search_filter = TaskFilters {
            completed: None,
            priority: None,
            category_id: None,
            search: Some("Milk".to_string()),
            due_date_before: None,
            due_date_after: None,
        };

        let desc_results = db.get_tasks(Some(desc_search_filter)).await
            .expect("Failed to search by description");
        
        assert_eq!(desc_results.len(), 1);
        assert_eq!(desc_results[0].title, "Buy Groceries");
    }
}

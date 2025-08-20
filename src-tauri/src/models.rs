use serde::{Deserialize, Serialize};
use validator::{Validate, ValidationError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ModelValidationError {
    #[error("Validation failed: {0}")]
    Invalid(String),
    #[error("Field '{field}' is required")]
    Required { field: String },
    #[error("Field '{field}' exceeds maximum length of {max}")]
    TooLong { field: String, max: usize },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: i64,
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
    pub priority: String,
    pub category_id: Option<i64>,
    pub due_date: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CreateTaskInput {
    #[validate(length(min = 1, max = 255, message = "Title must be between 1 and 255 characters"))]
    pub title: String,
    #[validate(length(max = 1000, message = "Description cannot exceed 1000 characters"))]
    pub description: Option<String>,
    #[validate(custom = "validate_priority")]
    pub priority: Option<String>,
    pub category_id: Option<i64>,
    #[validate(custom = "validate_date_format")]
    pub due_date: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTaskInput {
    pub id: i64,
    pub title: Option<String>,
    pub description: Option<String>,
    pub completed: Option<bool>,
    pub priority: Option<String>,
    pub category_id: Option<i64>,
    pub due_date: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub color: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CreateCategoryInput {
    #[validate(length(min = 1, max = 100, message = "Category name must be between 1 and 100 characters"))]
    pub name: String,
    #[validate(custom = "validate_color")]
    pub color: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: i64,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskFilters {
    pub completed: Option<bool>,
    pub priority: Option<String>,
    pub category_id: Option<i64>,
    pub search: Option<String>,
    pub due_date_before: Option<String>,
    pub due_date_after: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppSetting {
    pub key: String,
    pub value: String,
    pub updated_at: String,
}

// Validation functions
fn validate_priority(priority: &str) -> Result<(), ValidationError> {
    match priority {
        "low" | "medium" | "high" => Ok(()),
        _ => Err(ValidationError::new("Priority must be 'low', 'medium', or 'high'")),
    }
}

fn validate_date_format(date: &str) -> Result<(), ValidationError> {
    if chrono::DateTime::parse_from_rfc3339(date).is_ok() {
        Ok(())
    } else {
        Err(ValidationError::new("Date must be in ISO 8601 format"))
    }
}

fn validate_color(color: &str) -> Result<(), ValidationError> {
    if color.starts_with('#') && color.len() == 7 {
        if color[1..].chars().all(|c| c.is_ascii_hexdigit()) {
            Ok(())
        } else {
            Err(ValidationError::new("Color must be a valid hex color (e.g., #FF5733)"))
        }
    } else {
        Err(ValidationError::new("Color must be a valid hex color (e.g., #FF5733)"))
    }
}

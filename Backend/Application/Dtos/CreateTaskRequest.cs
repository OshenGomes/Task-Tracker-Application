using System.ComponentModel.DataAnnotations;

namespace Task_Tracker_Application.Application.Dtos;

public class CreateTaskRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Title must be between 2 and 200 characters")]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000, ErrorMessage = "Description must not exceed 1000 characters")]
    public string? Description { get; set; }

    public string Status { get; set; } = "ToDo";
    public string Priority { get; set; } = "Medium";

    [Required(ErrorMessage = "Due date is required")]
    public DateTime? DueDate { get; set; }
    public int? AssignedToUserId { get; set; }
    public string? Tags { get; set; }
}

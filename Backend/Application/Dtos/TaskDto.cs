namespace Task_Tracker_Application.Application.Dtos;

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "ToDo";
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? AssignedToUserId { get; set; }
    public string? Tags { get; set; }
}

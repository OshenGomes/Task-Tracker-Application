using Task_Tracker_Application.Models;

namespace Task_Tracker_Application.Data;

public class TaskTrackerDbContext
{
    public List<TaskItem> Tasks { get; } = new()
    {
        new TaskItem
        {
            Id = 1,
            Title = "Set up backend structure",
            Description = "Create initial project folders and models",
            Status = Models.TaskStatus.InProgress,
            Priority = Models.TaskPriority.High,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new TaskItem
        {
            Id = 2,
            Title = "Define task data model",
            Description = "Add task fields and status values",
            Status = Models.TaskStatus.ToDo,
            Priority = Models.TaskPriority.Medium,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        }
    };

    public List<User> Users { get; } = new()
    {
        new User
        {
            Id = 1,
            Name = "Admin",
            Email = "admin@example.com",
            Role = "Administrator",
            CreatedAt = DateTime.UtcNow
        }
    };
}

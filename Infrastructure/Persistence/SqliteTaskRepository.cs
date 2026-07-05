using Task_Tracker_Application.Application.Interfaces;
using Task_Tracker_Application.Domain.Entities;

namespace Task_Tracker_Application.Infrastructure.Persistence;

public class SqliteTaskRepository : ITaskRepository
{
    private readonly TaskTrackerDbContext _context;

    public SqliteTaskRepository(TaskTrackerDbContext context)
    {
        _context = context;
    }

    public IEnumerable<TaskItem> GetAll() => _context.Tasks.ToList();

    public TaskItem? GetById(int id) => _context.Tasks.Find(id);

    public TaskItem Create(TaskItem task)
    {
        _context.Tasks.Add(task);
        _context.SaveChanges();
        return task;
    }

    public void Update(TaskItem task)
    {
        _context.Tasks.Update(task);
        _context.SaveChanges();
    }

    public void Delete(TaskItem task)
    {
        _context.Tasks.Remove(task);
        _context.SaveChanges();
    }
}

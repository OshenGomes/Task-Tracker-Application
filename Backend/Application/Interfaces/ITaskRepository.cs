using Task_Tracker_Application.Domain.Entities;

namespace Task_Tracker_Application.Application.Interfaces;

public interface ITaskRepository
{
    IEnumerable<TaskItem> GetAll();
    TaskItem? GetById(int id);
    TaskItem Create(TaskItem task);
    void Update(TaskItem task);
    void Delete(TaskItem task);
}

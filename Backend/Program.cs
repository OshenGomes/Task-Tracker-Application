using Microsoft.EntityFrameworkCore;
using Task_Tracker_Application.Application.Interfaces;
using Task_Tracker_Application.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=tasktracker.db";
builder.Services.AddDbContext<TaskTrackerDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddScoped<IUserRepository, SqliteUserRepository>();
builder.Services.AddScoped<ITaskRepository, SqliteTaskRepository>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Tracker Application v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaskTrackerDbContext>();
    db.Database.EnsureCreated();
}

app.Run();

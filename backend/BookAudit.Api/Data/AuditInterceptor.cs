using System.Text.Json;
using BookAudit.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace BookAudit.Api.Data;

public class AuditInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        BuildAuditEntries(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        BuildAuditEntries(eventData.Context);
        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static void BuildAuditEntries(DbContext? context)
    {
        if (context is null) return;

        var history = new List<BookHistory>();
        var now = DateTime.UtcNow;

        var bookEntries = context.ChangeTracker.Entries<Book>().ToList();

        foreach (var entry in bookEntries)
        {
            var bookId = entry.Entity.Id;

            if (entry.State == EntityState.Added)
            {
                history.Add(new BookHistory
                {
                    BookId = bookId,
                    ChangedAt = now,
                    Action = "Created",
                    PropertyName = "Book",
                    OldValue = null,
                    NewValue = entry.Entity.Title,
                    Description = $"Book '{entry.Entity.Title}' was created"
                });

                foreach (var property in entry.Properties)
                {
                    var propertyName = property.Metadata.Name;
                    if (propertyName is nameof(Book.Title) or nameof(Book.Slug) or nameof(Book.IsDeleted) or nameof(Book.Id) or nameof(Book.CreatedAt))
                        continue;

                    var currentValue = property.CurrentValue;
                    if (currentValue is null) continue;

                    var displayValue = FormatValue(currentValue);
                    history.Add(new BookHistory
                    {
                        BookId = bookId,
                        ChangedAt = now,
                        Action = "Created",
                        PropertyName = propertyName,
                        OldValue = null,
                        NewValue = displayValue,
                        Description = $"{propertyName} was set to '{displayValue}'"
                    });
                }
            }
            else if (entry.State == EntityState.Deleted)
            {
                history.Add(new BookHistory
                {
                    BookId = bookId,
                    ChangedAt = now,
                    Action = "Deleted",
                    PropertyName = "Book",
                    OldValue = entry.Entity.Title,
                    NewValue = null,
                    Description = $"Book '{entry.Entity.Title}' was deleted"
                });
            }
            else if (entry.State == EntityState.Modified)
            {
                var isDeletedChanged = entry.Property(b => b.IsDeleted).IsModified;
                var isDeleted = entry.Entity.IsDeleted;

                if (isDeletedChanged && isDeleted)
                {
                    history.Add(new BookHistory
                    {
                        BookId = bookId,
                        ChangedAt = now,
                        Action = "Deleted",
                        PropertyName = "Book",
                        OldValue = entry.Entity.Title,
                        NewValue = null,
                        Description = $"Book '{entry.Entity.Title}' was deleted"
                    });
                }
                else
                {
                    foreach (var property in entry.Properties)
                    {
                        if (!property.IsModified || property.Metadata.Name == nameof(Book.IsDeleted) || property.Metadata.Name == nameof(Book.Slug))
                            continue;

                        var oldValue = FormatValue(property.OriginalValue);
                        var newValue = FormatValue(property.CurrentValue);
                        var displayName = property.Metadata.Name;

                        history.Add(new BookHistory
                        {
                            BookId = bookId,
                            ChangedAt = now,
                            Action = "Updated",
                            PropertyName = displayName,
                            OldValue = oldValue,
                            NewValue = newValue,
                            Description = $"{displayName} was changed from '{oldValue}' to '{newValue}'"
                        });
                    }
                }
            }
        }

        if (history.Count > 0)
        {
            context.Set<BookHistory>().AddRange(history);
        }
    }

    private static string? FormatValue(object? value)
    {
        if (value is null) return null;
        if (value is string s) return s;
        return JsonSerializer.Serialize(value);
    }
}
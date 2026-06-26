using BookAudit.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Text.Json;

namespace BookAudit.Api.Data;

public class AuditInterceptor : SaveChangesInterceptor
{
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;
        if (context == null) return await base.SavingChangesAsync(eventData, result, cancellationToken);

        var histories = new List<BookHistory>();

        var entries = context.ChangeTracker.Entries<Book>().ToList();

        foreach (var entry in entries)
        {
            var history = new BookHistory
            {
                BookId = entry.Entity.Id,
                BookSlug = entry.Entity.Slug,
                Timestamp = DateTime.UtcNow
            };

            if (entry.State == EntityState.Added)
            {
                history.Action = "Created";
                history.Changes = Serialize(entry.Entity);
            }
            else if (entry.State == EntityState.Modified)
            {
                var wasDeleted = entry.OriginalValues.GetValue<bool>("IsDeleted");
                var isDeleted = entry.Entity.IsDeleted;

                history.Action = !wasDeleted && isDeleted ? "Deleted" : "Updated";
                history.Changes = JsonSerializer.Serialize(entry.OriginalValues.ToObject());
            }
            else if (entry.State == EntityState.Deleted)
            {
                history.Action = "Deleted";
                history.Changes = Serialize(entry.Entity);
            }
            else
            {
                continue;
            }

            histories.Add(history);
        }

        if (histories.Count > 0)
        {
            context.Set<BookHistory>().AddRange(histories);
        }

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static string? Serialize(Book book)
    {
        return JsonSerializer.Serialize(new
        {
            book.Title,
            book.Author,
            book.Description,
            book.Slug
        });
    }
}
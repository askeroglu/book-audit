namespace BookAudit.Api.Models;

public class BookHistory
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public Book Book { get; set; } = null!;
    public DateTime ChangedAt { get; set; }
    public string Action { get; set; } = string.Empty;
    public string PropertyName { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string Description { get; set; } = string.Empty;
}
using Microsoft.Extensions.ObjectPool;
namespace BookAudit.Api.Models;

public class BookHistory
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string? BookSlug { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Changes { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
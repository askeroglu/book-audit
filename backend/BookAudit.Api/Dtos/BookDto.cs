namespace BookAudit.Api.Dtos;

public class BookDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public DateOnly PublishDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> Authors { get; set; } = new();
}
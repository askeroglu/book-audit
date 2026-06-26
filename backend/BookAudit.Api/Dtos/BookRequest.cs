using System.ComponentModel.DataAnnotations;

namespace BookAudit.Api.Dtos;

public abstract class BookRequest
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000, ErrorMessage = "Short description cannot exceed 1000 characters.")]
    public string? ShortDescription { get; set; }

    [Required(ErrorMessage = "Publish date is required.")]
    [CustomValidation(typeof(BookRequest), nameof(ValidatePublishDate))]
    public DateOnly PublishDate { get; set; }

    public static ValidationResult? ValidatePublishDate(DateOnly publishDate, ValidationContext context)
    {
        if (publishDate > DateOnly.FromDateTime(DateTime.UtcNow))
            return new ValidationResult("Publish date cannot be in the future.");

        return ValidationResult.Success;
    }

    [Required(ErrorMessage = "At least one author is required.")]
    [MinLength(1, ErrorMessage = "At least one author is required.")]
    public List<string> AuthorNames { get; set; } = new();
}

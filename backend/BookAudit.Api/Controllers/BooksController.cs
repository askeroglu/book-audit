using BookAudit.Api.Dtos;
using BookAudit.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookAudit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _service;

    public BooksController(IBookService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<BookDto>>> GetAll([FromQuery] BookListRequest request)
    {
        var books = await _service.GetAllAsync(request);
        return Ok(books);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<BookDto>> GetBySlug(string slug)
    {
        var book = await _service.GetBySlugAsync(slug);
        return book == null ? NotFound() : Ok(book);
    }

    [HttpPost]
    public async Task<ActionResult<BookDto>> Create(CreateBookRequest request)
    {
        var book = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetBySlug), new { slug = book.Slug }, book);
    }

    [HttpPut("{slug}")]
    public async Task<ActionResult<BookDto>> Update(string slug, UpdateBookRequest request)
    {
        var book = await _service.UpdateAsync(slug, request);
        return book == null ? NotFound() : Ok(book);
    }

    [HttpDelete("{slugOrId}")]
    public async Task<IActionResult> Delete(string slugOrId)
    {
        var deleted = await _service.DeleteAsync(slugOrId);
        return deleted ? NoContent() : NotFound();
    }
}
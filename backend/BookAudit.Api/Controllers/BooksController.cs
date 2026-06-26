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
    public async Task<ActionResult<IEnumerable<BookDto>>> GetAll()
    {
        var books = await _service.GetAllAsync();
        return Ok(books);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookDto>> GetById(int id)
    {
        var book = await _service.GetByIdAsync(id);
        return book == null ? NotFound() : Ok(book);
    }

    [HttpPost]
    public async Task<ActionResult<BookDto>> Create(CreateBookRequest request)
    {
        var book = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BookDto>> Update(int id, UpdateBookRequest request)
    {
        var book = await _service.UpdateAsync(id, request);
        return book == null ? NotFound() : Ok(book);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
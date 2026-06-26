using BookAudit.Api.Dtos;
using BookAudit.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookAudit.Api.Controllers;

[ApiController]
[Route("api/books/{bookSlug}/history")]
public class BookHistoryController : ControllerBase
{
    private readonly IBookService _bookService;

    public BookHistoryController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<BookHistoryDto>>> GetHistory(
        string bookSlug,
        [FromQuery] HistoryQueryParameters query)
    {
        var result = await _bookService.GetBookHistoryAsync(bookSlug, query);
        return Ok(result);
    }
}
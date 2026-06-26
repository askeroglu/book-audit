using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookAudit.Api.Migrations
{
    /// <inheritdoc />
    public partial class RefactorBookHistoryToPropertyLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "BookHistories",
                newName: "PropertyName");

            migrationBuilder.RenameColumn(
                name: "Changes",
                table: "BookHistories",
                newName: "OldValue");

            migrationBuilder.RenameColumn(
                name: "BookSlug",
                table: "BookHistories",
                newName: "NewValue");

            migrationBuilder.AddColumn<DateTime>(
                name: "ChangedAt",
                table: "BookHistories",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "BookHistories",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChangedAt",
                table: "BookHistories");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "BookHistories");

            migrationBuilder.RenameColumn(
                name: "PropertyName",
                table: "BookHistories",
                newName: "Timestamp");

            migrationBuilder.RenameColumn(
                name: "OldValue",
                table: "BookHistories",
                newName: "Changes");

            migrationBuilder.RenameColumn(
                name: "NewValue",
                table: "BookHistories",
                newName: "BookSlug");
        }
    }
}

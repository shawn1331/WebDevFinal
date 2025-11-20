namespace Connect4.Api.Models;

public record CreateRoomDto(string HostName, string RoomName, string Size = "7x6", bool Ranked = false, int TimerSec = 0);
public record JoinDto(string PlayerName);
public record MoveDto(string Token, int Column);
# -------- Build stage --------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy everything into the container build context
COPY . .

# Publish the API project (it references the Logic project)
RUN dotnet publish server/Connect4.Api/Connect4.Api.csproj -c Release -o /app/publish

# -------- Runtime stage --------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy published output from build stage
COPY --from=build /app/publish .

# Tell ASP.NET to listen on port 8080 inside the container
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Start the API
ENTRYPOINT ["dotnet", "Connect4.Api.dll"]

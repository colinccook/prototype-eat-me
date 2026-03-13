var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.EatMe_ApiService>("apiservice")
    .WithHttpHealthCheck("/health");

// Add the React frontend
var reactApp = builder.AddNpmApp("react-frontend", "../react-app", "dev")
    .WithHttpEndpoint(port: 3000, targetPort: 3000, env: "PORT")
    .WithExternalHttpEndpoints();

builder.AddProject<Projects.EatMe_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("/health")
    .WithReference(apiService)
    .WaitFor(apiService);

builder.Build().Run();

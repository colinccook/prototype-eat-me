using Microsoft.Playwright;
using TechTalk.SpecFlow;

namespace EatMe.Tests.Hooks;

[Binding]
public class PlaywrightHooks
{
    private readonly ScenarioContext _scenarioContext;
    private static IPlaywright? _playwright;
    private static IBrowser? _browser;

    public PlaywrightHooks(ScenarioContext scenarioContext)
    {
        _scenarioContext = scenarioContext;
    }

    [BeforeTestRun]
    public static async Task BeforeTestRun()
    {
        _playwright = await Playwright.CreateAsync();
        _browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = true
        });
    }

    [AfterTestRun]
    public static async Task AfterTestRun()
    {
        if (_browser != null)
        {
            await _browser.CloseAsync();
        }
        _playwright?.Dispose();
    }

    [BeforeScenario]
    public async Task BeforeScenario()
    {
        if (_browser == null)
        {
            throw new InvalidOperationException("Browser not initialized");
        }
        
        var context = await _browser.NewContextAsync();
        var page = await context.NewPageAsync();
        _scenarioContext["Page"] = page;
        _scenarioContext["Context"] = context;
    }

    [AfterScenario]
    public async Task AfterScenario()
    {
        if (_scenarioContext.TryGetValue("Context", out IBrowserContext? context) && context != null)
        {
            await context.CloseAsync();
        }
    }
}

using Microsoft.Playwright;
using NUnit.Framework;
using TechTalk.SpecFlow;

namespace EatMe.Tests.StepDefinitions;

[Binding]
public class FoodDisplaySteps
{
    private readonly ScenarioContext _scenarioContext;
    private IPage Page => _scenarioContext.Get<IPage>("Page");
    
    // Base URL - in a real scenario, this would be configurable
    private const string BaseUrl = "http://localhost:3000";

    public FoodDisplaySteps(ScenarioContext scenarioContext)
    {
        _scenarioContext = scenarioContext;
    }

    [Given(@"I navigate to the application")]
    public async Task GivenINavigateToTheApplication()
    {
        await Page.GotoAsync(BaseUrl);
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    [Then(@"I should see the ""(.*)"" header")]
    public async Task ThenIShouldSeeTheHeader(string headerText)
    {
        var header = Page.Locator("h1");
        await header.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
        var text = await header.TextContentAsync();
        Assert.That(text, Does.Contain(headerText));
    }

    [Then(@"I should see the welcome message")]
    public async Task ThenIShouldSeeTheWelcomeMessage()
    {
        var welcomeMessage = Page.Locator(".welcome-message");
        await welcomeMessage.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
        var isVisible = await welcomeMessage.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [When(@"I select the ""(.*)"" region")]
    public async Task WhenISelectTheRegion(string regionName)
    {
        var regionSelect = Page.Locator("#region-select");
        await regionSelect.SelectOptionAsync(new SelectOptionValue { Label = regionName });
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    [Then(@"I should see restaurant options")]
    public async Task ThenIShouldSeeRestaurantOptions()
    {
        var restaurantSelect = Page.Locator("#restaurant-select");
        await restaurantSelect.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
        var isVisible = await restaurantSelect.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [When(@"I select vegetarian only filter")]
    public async Task WhenISelectVegetarianOnlyFilter()
    {
        var checkbox = Page.Locator("input[type='checkbox']").Filter(new LocatorFilterOptions { HasText = "Vegetarian" });
        await checkbox.First.CheckAsync();
        await Page.WaitForTimeoutAsync(500); // Wait for filter to apply
    }

    [Then(@"I should see only vegetarian food items")]
    public async Task ThenIShouldSeeOnlyVegetarianFoodItems()
    {
        var foodCards = Page.Locator(".food-card");
        var count = await foodCards.CountAsync();
        
        if (count > 0)
        {
            // Check that vegetarian badges are present on all visible items
            var vegetarianBadges = Page.Locator(".badge.vegetarian");
            var badgeCount = await vegetarianBadges.CountAsync();
            Assert.That(badgeCount, Is.EqualTo(count), "All food items should be vegetarian");
        }
    }

    [When(@"I set maximum calories to (.*)")]
    public async Task WhenISetMaximumCaloriesTo(int maxCalories)
    {
        var calorieInput = Page.Locator("input[type='number']");
        await calorieInput.FillAsync(maxCalories.ToString());
        await Page.WaitForTimeoutAsync(500); // Wait for filter to apply
    }

    [Then(@"all displayed items should have (.*) or fewer calories")]
    public async Task ThenAllDisplayedItemsShouldHaveOrFewerCalories(int maxCalories)
    {
        var calorieValues = Page.Locator(".nutrition-item").First.Locator(".nutrition-value");
        var count = await calorieValues.CountAsync();
        
        for (int i = 0; i < count; i++)
        {
            var calorieText = await calorieValues.Nth(i).TextContentAsync();
            if (!string.IsNullOrEmpty(calorieText) && int.TryParse(calorieText, out var calories))
            {
                Assert.That(calories, Is.LessThanOrEqualTo(maxCalories), 
                    $"Item has {calories} calories, expected <= {maxCalories}");
            }
        }
    }

    [When(@"I sort by ""(.*)""")]
    public async Task WhenISortBy(string sortOption)
    {
        var sortSelect = Page.Locator(".filter-section select").Last;
        await sortSelect.SelectOptionAsync(new SelectOptionValue { Label = sortOption });
        await Page.WaitForTimeoutAsync(500); // Wait for sort to apply
    }

    [Then(@"items should be sorted by protein in descending order")]
    public async Task ThenItemsShouldBeSortedByProteinInDescendingOrder()
    {
        var proteinValues = Page.Locator(".nutrition-item:nth-child(2) .nutrition-value");
        var count = await proteinValues.CountAsync();
        
        var proteins = new List<double>();
        for (int i = 0; i < count; i++)
        {
            var text = await proteinValues.Nth(i).TextContentAsync();
            if (!string.IsNullOrEmpty(text) && double.TryParse(text.Replace("g", ""), out var protein))
            {
                proteins.Add(protein);
            }
        }

        for (int i = 0; i < proteins.Count - 1; i++)
        {
            Assert.That(proteins[i], Is.GreaterThanOrEqualTo(proteins[i + 1]),
                $"Items not sorted correctly: {proteins[i]} should be >= {proteins[i + 1]}");
        }
    }
}

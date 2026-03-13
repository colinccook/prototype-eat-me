Feature: Food Display
    As a user
    I want to see food items on the website
    So that I can make informed dietary choices

@smoke
Scenario: Default region is selected automatically
    Given I navigate to the application
    When I open the settings panel
    Then the "United Kingdom" region should be selected by default
    And I should see restaurant options without choosing a region

@smoke
Scenario: Show loading when switching regions
    Given I navigate to the application
    When I open the settings panel
    And I clear the region selection
    And I select the "United Kingdom" region
    Then I should see a syncing data indicator

@filter
Scenario: Filter vegetarian foods
    Given I navigate to the application
    When I open the settings panel
    And I select the "United Kingdom" region
    And I select vegetarian only filter
    Then I should see only vegetarian food items

@filter
Scenario: Filter by maximum calories
    Given I navigate to the application
    When I open the settings panel
    And I select the "United Kingdom" region
    And I set maximum calories to 300
    Then all displayed items should have 300 or fewer calories

@sort
Scenario: Sort by highest protein
    Given I navigate to the application
    When I open the settings panel
    And I select the "United Kingdom" region
    And I sort by "Protein (High to Low)"
    Then items should be sorted by protein in descending order

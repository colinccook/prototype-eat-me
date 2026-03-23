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
Scenario: Default sort is protein per calorie
    Given I navigate to the application
    When food items have loaded
    Then the sort pill should show "Protein per Calorie"
    And items should be optimized for protein efficiency

@sort
Scenario: Sort by highest protein
    Given I navigate to the application
    When food items have loaded
    And I sort by "Highest Protein"
    Then items should be sorted by protein in descending order

@sort
Scenario: Sort by lowest calories
    Given I navigate to the application
    When food items have loaded
    And I sort by "Lowest Calories"
    Then items should be sorted by calories in ascending order

@sort
Scenario: Sort by highest calories
    Given I navigate to the application
    When food items have loaded
    And I sort by "Highest Calories"
    Then items should be sorted by calories in descending order

@sort
Scenario: Sort by lowest fat
    Given I navigate to the application
    When food items have loaded
    And I sort by "Lowest Fat"
    Then items should be sorted by fat content in ascending order

@sort
Scenario: Sort by best fibre ratio
    Given I navigate to the application
    When food items have loaded
    And I sort by "Best Fibre Ratio"
    Then items with best fibre to carb ratio should appear first
    And items without fibre data should appear at the end

@sort
Scenario: Sort by lowest salt
    Given I navigate to the application
    When food items have loaded
    And I sort by "Lowest Salt"
    Then items should be sorted by salt content in ascending order
    And items without salt data should appear at the end

@sort
Scenario: Sort alphabetically by name
    Given I navigate to the application
    When food items have loaded
    And I sort by "A-Z"
    Then items should be sorted alphabetically by name

@detail
Scenario: Tap menu item to view details
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item
    Then I should see a detail modal slide up from the bottom
    And the modal should display the food name and nutritional information

@detail
Scenario: Dismiss detail modal by tapping backdrop
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item
    And I tap on the modal backdrop
    Then the detail modal should close

@detail
Scenario: Dismiss detail modal using close button
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item
    And I tap the close button on the modal
    Then the detail modal should close

@detail
Scenario: Detail modal shows all nutritional information regardless of sort
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item
    Then the detail modal should display all core macronutrients
    And the detail modal should display the nutrition insights section
    And the nutrition insights should show traffic light ratings for all perspectives

@detail
Scenario: Detail modal displays allergens when available
    Given I navigate to the application
    When I filter to a restaurant with allergen data
    And I tap on a food item
    Then the detail modal should display allergen tags if present

@detail
Scenario: Detail modal displays saturated fat and sugar when available
    Given I navigate to the application
    When I filter to a restaurant with complete nutrition data
    And I tap on a food item
    Then the detail modal should display Sat Fat
    And the detail modal should display Sugar

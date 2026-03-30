Feature: Item Type Filter
    As a user
    I want to filter menu items by type (food or drinks)
    So that I can find food or drink options that match my goals

@type-filter
Scenario: Default view shows food items
    Given I navigate to the application
    When food items have loaded
    Then the type pill should show "Food"
    And food items should be visible
    And drink items should not be visible

@type-filter
Scenario: Switch to drinks view
    Given I navigate to the application
    When food items have loaded
    And I select the "Drinks" type
    Then the type pill should show "Drinks"
    And drink items should be visible
    And food items should not be visible

@type-filter
Scenario: Switch back to food view
    Given I navigate to the application
    When food items have loaded
    And I select the "Drinks" type
    And I select the "Food" type
    Then the type pill should show "Food"
    And food items should be visible

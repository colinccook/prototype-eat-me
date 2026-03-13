Feature: Food Display
    As a user
    I want to see food items on the website
    So that I can make informed dietary choices

@smoke
Scenario: Display welcome page
    Given I navigate to the application
    Then I should see the "Eat Me" header
    And I should see the welcome message

@smoke
Scenario: Select a region
    Given I navigate to the application
    When I select the "United Kingdom" region
    Then I should see restaurant options

@filter
Scenario: Filter vegetarian foods
    Given I navigate to the application
    When I select the "United Kingdom" region
    And I select vegetarian only filter
    Then I should see only vegetarian food items

@filter
Scenario: Filter by maximum calories
    Given I navigate to the application
    When I select the "United Kingdom" region
    And I set maximum calories to 300
    Then all displayed items should have 300 or fewer calories

@sort
Scenario: Sort by highest protein
    Given I navigate to the application
    When I select the "United Kingdom" region
    And I sort by "Protein (High to Low)"
    Then items should be sorted by protein in descending order

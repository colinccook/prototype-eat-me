Feature: Notice Cards
    As a user
    I want to see a cookie consent card and AI disclaimer card
    So that I can make informed decisions about data collection and AI-generated content

@consent
Scenario: Cookie consent card is shown on first visit
    Given I navigate to the application
    When food items have loaded
    Then I should see the cookie consent card at the top of the food grid
    And the cookie consent card should have "Accept cookies" and "Refuse cookies" buttons

@consent
Scenario: Accepting cookies hides the consent card
    Given I navigate to the application
    When food items have loaded
    And I click "Accept cookies" on the cookie consent card
    Then the cookie consent card should disappear

@consent
Scenario: Refusing cookies hides the consent card
    Given I navigate to the application
    When food items have loaded
    And I click "Refuse cookies" on the cookie consent card
    Then the cookie consent card should disappear

@consent
Scenario: Cookie consent choice persists across page reloads
    Given I navigate to the application
    When food items have loaded
    And I click "Accept cookies" on the cookie consent card
    And I reload the page
    Then the cookie consent card should not be visible

@disclaimer
Scenario: AI disclaimer card is shown on first visit
    Given I navigate to the application
    When food items have loaded
    Then I should see the AI disclaimer card at the top of the food grid
    And the AI disclaimer card should mention AI-processed nutritional data

@disclaimer
Scenario: Dismissing the AI disclaimer hides the card
    Given I navigate to the application
    When food items have loaded
    And I click "Got it, dismiss" on the AI disclaimer card
    Then the AI disclaimer card should disappear

@disclaimer
Scenario: AI disclaimer dismissal persists across page reloads
    Given I navigate to the application
    When food items have loaded
    And I click "Got it, dismiss" on the AI disclaimer card
    And I reload the page
    Then the AI disclaimer card should not be visible

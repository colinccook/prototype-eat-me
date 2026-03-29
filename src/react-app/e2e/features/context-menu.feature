Feature: Food Item Context Menu
    As a user viewing a food item detail
    I want a context menu with useful actions
    So that I can share items and filter restaurants quickly

@context-menu
Scenario: Context menu trigger is visible on the detail modal
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item
    Then I should see a context menu trigger button on the detail modal

@context-menu
Scenario: Context menu opens when clicking the trigger button
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item
    And I click the context menu trigger
    Then I should see the context menu with actions

@context-menu
Scenario: Context menu contains a Share action
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item
    And I click the context menu trigger
    Then the context menu should contain a "Share" action

@context-menu
Scenario: Sharing from the context menu copies a link
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item
    And I click the context menu trigger
    And I click the "Share" action
    Then I should see a "Link copied to clipboard" toast

@context-menu
Scenario: Context menu contains restaurant filter actions for items with a restaurant
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item from "McDonald's"
    And I click the context menu trigger
    Then the context menu should contain a "Hide all McDonald's" action
    And the context menu should contain an "Only show McDonald's" action

@context-menu
Scenario: Only show restaurant filters to that restaurant
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item from "McDonald's"
    And I click the context menu trigger
    And I click the "Only show McDonald's" action
    Then the detail modal should close
    And the restaurants pill should show "McDonald's"
    And all visible food items should be from "McDonald's"

@context-menu
Scenario: Hide all restaurant filters out that restaurant
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item from "McDonald's"
    And I click the context menu trigger
    And I click the "Hide all McDonald's" action
    Then the detail modal should close
    And no visible food items should be from "McDonald's"

@context-menu
Scenario: Context menu closes when clicking outside
    Given I navigate to the application
    When food items have loaded
    And I tap on a food item
    And I click the context menu trigger
    And I click outside the context menu
    Then the context menu should close

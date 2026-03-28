Feature: Swipe Actions and Favourites
    As a user browsing food items
    I want to swipe left to hide items and swipe right to favourite them
    So that I can curate my food list to my preferences

@swipe
Scenario: Swipe left on a food item to hide it
    Given I navigate to the application
    When food items have loaded
    And I swipe left on a food item
    Then the item should disappear from the list
    And I should see a hidden count in the results header

@swipe
Scenario: Hidden count displays correctly with show all link
    Given I navigate to the application
    When food items have loaded
    And I swipe left on a food item
    Then the results header should show the hidden count
    And the results header should contain a "show all" link

@swipe
Scenario: Show all unhides all hidden items
    Given I navigate to the application
    When food items have loaded
    And I swipe left on a food item
    And I click the "show all" link
    Then all items should be visible again
    And the hidden count should not be displayed

@favourite
Scenario: Swipe right on a food item to favourite it hides from search
    Given I navigate to the application
    When food items have loaded
    And I swipe right on a food item
    Then the item should disappear from the search list
    And I should see a hidden count in the results header

@favourite
Scenario: Favourited items appear in the favourites tab
    Given I navigate to the application
    When food items have loaded
    And I swipe right on a food item to favourite it
    And I tap the Favourites tab
    Then I should see the favourited item in the favourites list

@favourite
Scenario: Swipe left on favourites view removes the favourite
    Given I navigate to the application
    When food items have loaded
    And I swipe right on a food item to favourite it
    And I tap the Favourites tab
    And I swipe left on a favourited item
    Then the item should be removed from the favourites list

@favourite
Scenario: Swipe right on favourites view does nothing
    Given I navigate to the application
    When food items have loaded
    And I swipe right on a food item to favourite it
    And I tap the Favourites tab
    Then swiping right on a favourited item should have no effect

@favourite
Scenario: Clear all favourites removes all favourited items
    Given I navigate to the application
    When food items have loaded
    And I swipe right on a food item to favourite it
    And I tap the Favourites tab
    And I click the "Clear all" button
    Then the favourites list should be empty
    And I should see the no favourites message

@favourite
Scenario: Show all in search view resets favourites and hidden items
    Given I navigate to the application
    When food items have loaded
    And I swipe right on a food item to favourite it
    And I swipe left on a food item to hide it
    And I click the "show all" link
    Then all items should be visible again
    And the hidden count should not be displayed

@navigation
Scenario: Bottom app bar shows Search and Favourites tabs
    Given I navigate to the application
    When the page has loaded
    Then I should see a bottom app bar
    And the bottom app bar should have a Search tab
    And the bottom app bar should have a Favourites tab
    And the Search tab should be active by default

@navigation
Scenario: Switching between Search and Favourites tabs
    Given I navigate to the application
    When food items have loaded
    And I tap the Favourites tab
    Then I should see the favourites view
    When I tap the Search tab
    Then I should see the search view with food items

@persistence
Scenario: Hidden items persist across page reloads
    Given I navigate to the application
    When food items have loaded
    And I swipe left on a food item to hide it
    And I reload the page
    Then the item should still be hidden

@persistence
Scenario: Favourite items persist across page reloads
    Given I navigate to the application
    When food items have loaded
    And I swipe right on a food item to favourite it
    And I reload the page
    And I tap the Favourites tab
    Then the item should still show as favourited

@navigation
Scenario: Favourites badge shows count
    Given I navigate to the application
    When food items have loaded
    And I swipe right on a food item to favourite it
    Then the Favourites tab should show a badge with count 1

@progressive
Scenario: Items load progressively as user scrolls
    Given I navigate to the application
    When food items have loaded
    Then only a batch of items should be visible initially
    When I scroll down to see more items
    Then more items should become visible

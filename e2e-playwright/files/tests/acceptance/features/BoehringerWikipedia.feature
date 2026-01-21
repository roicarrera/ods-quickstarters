@Wikipedia
Feature: Boehringer Wikipedia Page

  @testLevel:acceptance
  Scenario: JIRATESTID_Verify Header of Boehringer Wikipedia Page (Pass Sample Test Case)
    Given User navigates to the Boehringer Wikipedia Page
    Then User should see text 'Boehringer Ingelheim' in the title 

  @testLevel:acceptance
  Scenario: DIFFERENTJIRATESTID_Verify Header of Boehringer Wikipedia Page (Pass Sample Test Case)
    Given User navigates to the Boehringer Wikipedia Page
    Then User should see text 'Boehringer Ingelheim' in the title 


  #@testLevel:acceptance
  #Scenario: OTHERJIRATESTID_Verify Header of Boehringer Wikipedia Page (Fail Sample Test Case)
    #Given User navigates to the Boehringer Wikipedia Page
    #Then User should see text 'Another Text' in the title 
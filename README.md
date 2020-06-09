# TheDashboard
This github repository represents the re-build of TheDashboard. A data analysis tool used to display eye and simulator data of a Boeing 737NG. 
## The Re-Build Plan
In order to successfully re-build the application, roughly two and a half weeks will be needed. On top of that, a couple days to a full week is expected to resolve any possible bugs that present themselves.
### Week One: The Modeling Phase
In this phase I will rebuild each of the instruments as objects. There will be a hierarchical structure where the PFD is the parent class of the attitude indicator for example. I will also improve graphics.
**Key Dates:**
June 8: Intensive modeling day. Spend time planning the fields, dependencies, and methods each class will have.
June 9: Have a blank instrument panel. Similar to first version of framebuild. Improve underlying graphics.
June 10: Finish MCP class.
June 11: Finish PFD Class
June 12: Finish ND class. Write HTML for other buttons and pages. Combine classes into one page.
### Week Two: The Services Phase
In this phase I will handle manipulating the CSV data, storing it, and reading it at 20 or 60 Hz (TBD) I will build Angular Services and Directives to feed data into each instrument.
**Key Dates**
June 17: Be able to read data from CSV file and have each instrument read the variables it needs.
June 18: Play data at selected frequency. Build control menu with play, forward, and slider functionality.
June 19: Build functionality of misc. buttons. (Event indicators, settings tab)
### Week Three: Bugs & Synchronization Fixes
June 23: Have fully functional, synchronized tool ready to present. Meet with Peter to run a couple simulations and work through bugs.
June 25: Resolve all bugs.
June 26: Buffer.

---
Throughout the course of this plan, I will continue to attend data analysis sessions with Randy. Resolving any bugs from version 1.0 of the project to keep the analysis sessions smooth will be my first priority. After that I'll continue porting to Angular on the side.
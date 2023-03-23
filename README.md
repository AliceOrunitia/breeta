# breeta

My first self-directed deployed project. It is designed to replicate much of Twitter's functionality, with full CRUD for both users and "breets". It's built with JavaScript for both the back and front end, using Embedded JavaScript for the front and Express for the back. Styling is largely done via Bootstrap, with some custom CSS for certain elements. It's databased using MongoDB, and passwords are hashed and salted via the passport Node module. This project also features image uploads, via Cloudinary's API, client-side validations via the JOI module and some basic HTML sanitations.
I had built an infinite scroll functionality, but it is unlikely to work on all client as there are security issues to resolve regarding axios scripts running in-browser that are still to be resolved.
I plan to eventually rebuild this within React, for significantly improved efficiency in several aspects of the UI, especially in regards to producing stateful components for multiple uses, such as within notifications.
# aor-realtime

A custom saga enabling realtime update inside [Admin-on-rest](https://github.com/marmelab/admin-on-rest/).

## Installation

Install with:

```sh
npm install --save aor-realtime
```

or

```sh
yarn add aor-realtime
```

## Usage

Define an `observeRequest` function which will be called by the realtime saga whenever a `CRUD_GET_LIST` or `CRUD_GET_ONE` fetch
is triggered by Admin-on-rest ([documentation](https://marmelab.com/admin-on-rest/RestClients.html) about those).

This function will be called with the following parameters:

- `fetchType`: either `CRUD_GET_LIST` or `CRUD_GET_ONE`
- `resource`: the resource's name
- `params`: the fetch parameters
  - for `CRUD_GET_LIST`: `{ pagination: { page: {int} , perPage: {int} }, sort: { field: {string}, order: {string} }, filter: {Object} }`
  - for `CRUD_GET_ONE`: `{ id: {mixed} }`

This function must return an object with a `subscribe` method which will be called with an `observer`.
The `observer` have the following methods:

- `next(data)`: Call this method each time new data is received so that the Admin-on-rest views are updated.
- `complete()`: Call this method to indicates this subscription won't receive any new data.
- `error(error)`: Call this method when an error occurs.

The `subscribe` method must return a `subscription` object. The `subscription` object must have an `unsubscribe` method which will be called by the realtime saga when the query will not need to be observed anymore. This will happen each time the current route change and will give you the opportunity to clean up related sockets, apollo observable queries, etc. When called and after you cleaned up whatever needed cleaning, you **must** call the `observer.complete` method so that the realtime saga is notified about it.

Here is a very naive example using an interval to fetch data every 5 seconds:

```js
import realtimeSaga from 'aor-realtime';

const observeRequest = (fetchType, resource, params) => {
    // Use your apollo client methods here or sockets or whatever else including the following very naive polling mechanism
    return {
        subscribe(observer) {
            const intervalId = setInterval(() => {
                fetchData(fetchType, resource, params)
                    .then(results => observer.next(results)) // New data received, notify the observer
                    .catch(error => observer.error(error)); // Ouch, an error occured, notify the observer
            }, 5000);

            const subscription = {
                unsubscribe() {
                    // Clean up after ourselves
                    clearInterval(intervalId);
                    // Notify the saga that we cleaned up everything
                    observer.complete();
                }
            };

            return subscription;
        },
    };
};

const customSaga = realtimeSaga(observeRequest);
```

For a more realistic usage example, please refer to the realtime saga provided by the [aor-simple-graphql-client](https://github.com/marmelab/aor-simple-graphql-client).

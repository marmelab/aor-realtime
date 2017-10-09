import { FETCH_END } from 'admin-on-rest';

export default (
    { type, payload, meta: { fetch: restType, ...meta } },
    parsedApolloQueryResult,
) => ({
    type: `${type}_SUCCESS`,
    payload: parsedApolloQueryResult,
    requestPayload: payload,
    meta: { ...meta, fetchResponse: restType, fetchStatus: FETCH_END },
});

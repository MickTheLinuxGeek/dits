"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyGraphQLMiddleware = exports.createGraphQLContext = exports.createApolloServer = void 0;
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const express_1 = require("express");
const typeDefs_1 = require("./typeDefs");
const resolvers_1 = require("./resolvers");
const env_1 = require("../config/env");
/**
 * Creates and configures Apollo Server
 */
const createApolloServer = () => {
    return new server_1.ApolloServer({
        typeDefs: typeDefs_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        introspection: env_1.config.app.env !== 'production',
        formatError: (formattedError, error) => {
            var _a;
            // Log errors in development
            if (env_1.config.app.env === 'development') {
                console.error('GraphQL Error:', error);
            }
            // Don't expose internal errors in production
            if (env_1.config.app.env === 'production' && !((_a = formattedError.extensions) === null || _a === void 0 ? void 0 : _a.code)) {
                return {
                    message: 'Internal server error',
                    extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                    },
                };
            }
            return formattedError;
        },
    });
};
exports.createApolloServer = createApolloServer;
/**
 * Context factory for GraphQL requests
 */
const createGraphQLContext = (_a) => __awaiter(void 0, [_a], void 0, function* ({ req, res, }) {
    // TODO: Extract user from JWT token in Authorization header
    // For now, return empty context
    return {
        req,
        res,
        user: undefined,
    };
});
exports.createGraphQLContext = createGraphQLContext;
/**
 * Applies GraphQL middleware to Express app
 */
const applyGraphQLMiddleware = (app) => __awaiter(void 0, void 0, void 0, function* () {
    const apolloServer = (0, exports.createApolloServer)();
    // Start Apollo Server
    yield apolloServer.start();
    // Apply GraphQL middleware to /graphql endpoint
    app.use('/graphql', (0, express_1.json)(), (0, express4_1.expressMiddleware)(apolloServer, {
        context: exports.createGraphQLContext,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }));
    console.log(`GraphQL endpoint available at /graphql`);
});
exports.applyGraphQLMiddleware = applyGraphQLMiddleware;

import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Request } from 'express';
import { subgraph } from './config/subgraph.js';
import { LoggerModule } from './logger/logger.module.js';
import { HealthModule } from './health/health.module.js';

const handleAuth = ({ req }: { req: Request }) => {
    const token = req.headers?.authorization ?? null;
    const query = req.body?.query ?? '';
    const isIntrospection = query.includes('__schema') || query.includes('__type');
    return { token, isIntrospection };
};

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
            driver: ApolloGatewayDriver,
            server: {
                context: handleAuth,
            },
            gateway: {
                buildService: ({ url }) => {
                    return new RemoteGraphQLDataSource({
                        url,
                        willSendRequest({ request, context }: any) {
                            if (context.token) {
                                request.http.headers.set('authorization', context.token);
                            }
                            if (context.isIntrospection) {
                                request.http.headers.set('x-introspection', 'true');
                            }
                        },
                    });
                },
                supergraphSdl: new IntrospectAndCompose({
                    subgraphs: [
                        { name: 'account', url: subgraph.account },
                        { name: 'analytics', url: subgraph.analytics },
                        { name: 'authentication', url: subgraph.authentication },
                        { name: 'inventory', url: subgraph.inventory },
                        { name: 'invoice', url: subgraph.invoice },
                        // { name: 'logstream', url: subgraph.logstream },
                        { name: 'notification', url: subgraph.notification },
                        { name: 'order', url: subgraph.order },
                        { name: 'payment', url: subgraph.payment },
                        { name: 'person', url: subgraph.person },
                        { name: 'product', url: subgraph.product },
                        { name: 'profile', url: subgraph.profile },
                        { name: 'shopping-cart', url: subgraph.shoppingCart },
                        { name: 'transaction', url: subgraph.transaction },
                    ],
                }),
            },
        }),
        LoggerModule,
        HealthModule
    ],
})
export class AppModule {}

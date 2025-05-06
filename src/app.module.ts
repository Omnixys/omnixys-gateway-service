import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { subgraph } from './config/subgraph.js';
import { Request } from 'express';

const handleAuth = ({ req }: { req: Request }) => {
    const token = req.headers?.authorization ?? null;
    return { token };
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
                        request.http.headers.set('authorization', context.token || '');
                        request.http.headers.set('x-introspection', 'true'); // <- unser Signal
                    },
                });
            },
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
                { name: 'person', url: subgraph.person },
                { name: 'account', url: subgraph.account },
                { name: 'shopping-cart', url: subgraph.shoppingCart },
                { name: 'order', url: subgraph.order },
                { name: 'payment', url: subgraph.payment },
                { name: 'invoice', url: subgraph.invoice },
                { name: 'transaction', url: subgraph.transaction },
                { name: 'product', url: subgraph.product },
                { name: 'inventory', url: subgraph.inventory },
                //{ name: 'activity', url: subgraph.activity },
                { name: 'notification', url: subgraph.notification },
                { name: 'authentication', url: subgraph.authentication },
            ],
        }),
      },
    }),
  ],
})
export class AppModule {}

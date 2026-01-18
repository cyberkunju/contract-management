/**
 * Application Router
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { BlueprintList } from './pages/Blueprints/BlueprintList';
import { BlueprintCreate } from './pages/Blueprints/BlueprintCreate';
import { BlueprintEdit } from './pages/Blueprints/BlueprintEdit';
import { ContractCreate } from './pages/Contracts/ContractCreate';
import { ContractView } from './pages/Contracts/ContractView';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: 'blueprints',
                children: [
                    {
                        index: true,
                        element: <BlueprintList />,
                    },
                    {
                        path: 'new',
                        element: <BlueprintCreate />,
                    },
                    {
                        path: ':id/edit',
                        element: <BlueprintEdit />,
                    },
                ],
            },
            {
                path: 'contracts',
                children: [
                    {
                        index: true,
                        element: <Navigate to="/" replace />,
                    },
                    {
                        path: 'new',
                        element: <ContractCreate />,
                    },
                    {
                        path: ':id',
                        element: <ContractView />,
                    },
                ],
            },
            {
                path: '*',
                element: <NotFound />,
            },
        ],
    },
]);

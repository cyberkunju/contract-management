/**
 * Blueprint Edit Page
 */

import { useNavigate, useParams } from 'react-router-dom';
import { useBlueprintStore } from '../../../stores';
import { PageHeader } from '../../../components/Layout';
import { BlueprintForm } from '../../../components/features';
import type { BlueprintField } from '../../../types';

export function BlueprintEdit() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { getBlueprint, updateBlueprint } = useBlueprintStore();

    const blueprint = id ? getBlueprint(id) : undefined;

    if (!blueprint) {
        return (
            <>
                <PageHeader title="Blueprint Not Found" />
                <p>The blueprint you're looking for doesn't exist.</p>
            </>
        );
    }

    const handleSubmit = (data: { name: string; description: string; fields: BlueprintField[] }) => {
        updateBlueprint(blueprint.id, data);
        navigate('/blueprints');
    };

    return (
        <>
            <PageHeader
                title={`Edit: ${blueprint.name}`}
                description="Modify your contract template"
            />
            <BlueprintForm
                initialData={blueprint}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/blueprints')}
            />
        </>
    );
}

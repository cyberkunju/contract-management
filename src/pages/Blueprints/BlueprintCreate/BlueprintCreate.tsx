/**
 * Blueprint Create Page
 */

import { useNavigate } from 'react-router-dom';
import { useBlueprintStore } from '../../../stores';
import { PageHeader } from '../../../components/Layout';
import { BlueprintForm } from '../../../components/features';

export function BlueprintCreate() {
    const navigate = useNavigate();
    const addBlueprint = useBlueprintStore((state) => state.addBlueprint);

    const handleSubmit = (data: { name: string; description: string; fields: import('../../../types').BlueprintField[] }) => {
        addBlueprint(data);
        navigate('/blueprints');
    };

    return (
        <>
            <PageHeader
                title="Create Blueprint"
                description="Design a new contract template"
            />
            <BlueprintForm onSubmit={handleSubmit} onCancel={() => navigate('/blueprints')} />
        </>
    );
}

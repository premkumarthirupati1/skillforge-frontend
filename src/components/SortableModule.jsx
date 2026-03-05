import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableModule({ module }) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: module._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white p-4 rounded shadow mb-3 flex justify-between cursor-grab"
        >

            <span>
                {module.order}. {module.title}
            </span>

            <span className="text-gray-400">
                ≡
            </span>

        </div>
    );
}

export default SortableModule;
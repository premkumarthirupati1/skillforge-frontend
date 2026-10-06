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
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm mb-3 flex justify-between items-center cursor-grab hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
        >
            <span className="font-semibold text-sm">
                {module.order}. {module.title}
            </span>

            <span className="text-slate-400 dark:text-slate-500 text-lg">
                ≡
            </span>

        </div>
    );
}

export default SortableModule;
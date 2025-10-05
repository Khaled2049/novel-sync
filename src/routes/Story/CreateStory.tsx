import { SimpleEditor } from "../../components/SimpleEditor";

const CreateDocument = () => {
  return (
    <>
      <div className="px-4 bg-neutral-50 dark:bg-black transition-colors duration-200 min-h-screen">
        <SimpleEditor />
      </div>
    </>
  );
};

export default CreateDocument;

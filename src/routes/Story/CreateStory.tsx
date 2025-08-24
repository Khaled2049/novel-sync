import { SimpleEditor } from "../../components/SimpleEditor";

const CreateDocument = () => {
  return (
    <>
      <div className="px-4 bg-white dark:bg-black transition-colors duration-200 min-h-screen">
        <SimpleEditor />
      </div>
    </>
  );
};

export default CreateDocument;

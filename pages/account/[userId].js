import { useRouter } from "next/router";

import Navbar from "../../components/navbar";
import Link from "next/link";
import { FiEdit, FiBarChart } from "react-icons/fi";
import withAuth from "../../hocs/withAuth";


const UserTournaments = () => {
  const router = useRouter();
  const { userId } = router.query;


  return (
    <div className="w-screen min-h-screen bg-primary-700 flex flex-start flex-col">
      <Navbar></Navbar>
      <div className="p-4">
        

        <h2 className="text-primary-300 mt-6 text-xl font-medium mb-4">
          Your League History
        </h2>
       

      </div>
    </div>
  );
};

export default withAuth(UserTournaments, null);

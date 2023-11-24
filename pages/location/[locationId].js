// pages/LocationPage.js
import React from 'react';
import Navbar from '../../components/navbar';
import withAuth from '../../hocs/withAuth';
import LeaguesTable from '../../components/LeaguesTable';
import PlayersTable from '../../components/PlayersTable';
import CoursesTable from '../../components/CoursesTable';
import { useRouter } from 'next/router';

const LocationPage = () => {
  const router = useRouter();
  const { locationId } = router.query;

  return (
    <div className="w-screen min-h-screen bg-primary-700 flex flex-start flex-col">
      <Navbar></Navbar>
      <div className="p-6">
        <LeaguesTable locationId={locationId} />
				{/* <hr className="my-3"/>
        <PlayersTable locationId={locationId} /> */}
        
				{/* <hr className="my-3"/> */}

				<CoursesTable locationId={locationId} />
      </div>
    </div>
  );
};

export default withAuth(LocationPage, "manager");

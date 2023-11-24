import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../../../../firebaseConfig";
import BackupPreview from "../../../../../components/BackupPreview";
import Navbar from "../../../../../components/navbar";

export default function Backups() {
  const router = useRouter();
  const { tournamentId } = router.query;

  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState([]);
  const [expandedBackupId, setExpandedBackupId] = useState(null);

  useEffect(() => {
    if (tournamentId) {
      const backupCollection = collection(
        db,
        `tournaments/${tournamentId}/backups`
      );

      const backupQuery = query(backupCollection, orderBy("updatedAt", "desc"));

      const unsubscribe = onSnapshot(backupQuery, (querySnapshot) => {
        let backupsData = [];
        querySnapshot.forEach((doc) => {
          backupsData.push({ id: doc.id, ...doc.data() });
        });

        setBackups(backupsData);
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [tournamentId]);

  const handleExpand = (backupId) => {
    if (backupId === expandedBackupId) {
      setExpandedBackupId(null); // If the backup is already expanded, collapse it
    } else {
      setExpandedBackupId(backupId); // Else, expand it
    }
  };

  const goToManageTournament = () => {
    router.push(`/manage-tournament/${tournamentId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (backups.length === 0) {
    return (
      <div className="h-screen">
        <Navbar />
        <div className="w-full h-full flex items-center justify-center">
          No backups available for this tournament.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="flex justify-end p-2">
        <button
          className="border-primary-700 text-sm text-primary-700 font-medium border rounded-md hover:bg-gray-200 px-4 py-2"
          onClick={goToManageTournament}
        >
          Back to Manage Tournament
        </button>
      </div>
      {backups.map((backup, index) => (
        <div key={index} className="shadow p-4 mb-4 bg-white rounded">
          <div
            onClick={() => handleExpand(index)}
            className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors duration-200"
          >
            Backup from {new Date(backup.updatedAt?.toDate()).toLocaleString()}
          </div>
          {expandedBackupId === index && (
            <div className="mt-4 border-t pt-4">
              <BackupPreview backup={backup} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

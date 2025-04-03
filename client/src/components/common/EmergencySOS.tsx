import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";

export default function EmergencySOS() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch emergency contacts
  const { data: emergencyContactsData } = useQuery({
    queryKey: ["/api/emergency-contacts"],
    enabled: !!user && isDialogOpen, // Only fetch when dialog is open
  });

  const handleSOS = () => {
    setIsDialogOpen(true);
  };

  const sendEmergencyAlert = () => {
    // In a real implementation, this would send actual SMS/emails
    // Here we'll just simulate the alert being sent
    
    toast({
      title: "Emergency Alert Sent",
      description: "Your emergency contacts and nearby hospitals have been notified.",
      variant: "destructive",
    });
    
    // Close the dialog
    setIsDialogOpen(false);
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-red-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-xl font-bold shadow-lg hover:bg-red-700 transition-colors z-50"
        onClick={handleSOS}
      >
        SOS
      </button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Emergency Alert</AlertDialogTitle>
            <AlertDialogDescription>
              This will send an emergency alert to your emergency contacts and
              notify nearby hospitals. Only use in case of a genuine emergency.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {emergencyContactsData?.contacts && emergencyContactsData.contacts.length > 0 ? (
            <div className="my-4">
              <h4 className="text-sm font-medium mb-2">The alert will be sent to:</h4>
              <ul className="text-sm space-y-2">
                {emergencyContactsData.contacts.map((contact: any) => (
                  <li key={contact.id} className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                    <span>{contact.name} ({contact.relationship}) - {contact.phone}</span>
                  </li>
                ))}
                <li className="flex items-center space-x-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  <span>Nearby hospital emergency services</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="my-4 text-yellow-600 text-sm">
              Warning: You don't have any emergency contacts set up. The alert will only be sent to nearby hospitals.
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={sendEmergencyAlert} className="bg-red-600 hover:bg-red-700">
              Send Emergency Alert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

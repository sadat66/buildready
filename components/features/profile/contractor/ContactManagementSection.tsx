"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Mail, Phone } from "lucide-react";

interface Contact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface ContactManagementSectionProps {
  contractor_contacts: Contact[];
  onAddContact: () => void;
  onRemoveContact: (index: number) => void;
  onUpdateContact: (index: number, field: string, value: string) => void;
}

export function ContactManagementSection({ 
  contractor_contacts, 
  onAddContact, 
  onRemoveContact, 
  onUpdateContact 
}: ContactManagementSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Contractor Contacts</h3>
            <p className="text-sm text-slate-600">Manage your team contacts and roles</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {contractor_contacts.map((contact, index) => (
          <div key={index} className="border border-slate-200 rounded-lg p-6 space-y-4 bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-slate-800 flex items-center space-x-2">
                <User className="h-4 w-4 text-orange-600" />
                <span>Contact {index + 1}</span>
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveContact(index)}
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Name</span>
                </Label>
                <Input
                  value={contact.name}
                  onChange={(e) => onUpdateContact(index, "name", e.target.value)}
                  placeholder="Enter contact name"
                  className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <span>Role</span>
                </Label>
                <Input
                  value={contact.role}
                  onChange={(e) => onUpdateContact(index, "role", e.target.value)}
                  placeholder="Enter role/position"
                  className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>Email</span>
                </Label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => onUpdateContact(index, "email", e.target.value)}
                  placeholder="Enter email address"
                  className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span>Phone</span>
                </Label>
                <Input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => onUpdateContact(index, "phone", e.target.value)}
                  placeholder="Enter phone number"
                  className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={onAddContact}
          className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 flex items-center space-x-2"
        >
          <User className="h-4 w-4" />
          <span>Add Contact</span>
        </Button>
      </div>
    </div>
  );
}

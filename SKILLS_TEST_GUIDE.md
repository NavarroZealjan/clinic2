# 📋 Clinic Dashboard - Skills Test Quick Reference Guide

## 🗂️ Project Structure Overview

\`\`\`
clinic-dashboard/
├── app/                          # Pages and routes
│   ├── admin/                    # Admin dashboard pages
│   ├── doctor/                   # Doctor dashboard pages
│   ├── staff/                    # Staff dashboard pages
│   ├── login/                    # Login page
│   ├── api/                      # API endpoints
│   └── layout.jsx                # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   └── [custom-components].jsx   # Your custom components
├── lib/                          # Utility functions
├── scripts/                      # Database scripts
└── middleware.ts                 # Authentication middleware
\`\`\`

---

## 🎯 Common Enhancement Scenarios & Where to Code Them

### 1. Adding a New Page/Feature

**Example: "Add a Reports page for admins"**

**Steps:**
1. **Create the page:** `app/admin/reports/page.jsx`
2. **Add navigation link:** Update `components/admin-sidebar.tsx`
3. **Create API if needed:** `app/api/reports/route.js`
4. **Add database table if needed:** `scripts/XXX_create_reports_table.sql`

**Template for new page:**
\`\`\`jsx
// app/admin/reports/page.jsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/reports')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      {/* Your content here */}
    </div>
  )
}
\`\`\`

---

### 2. Adding a New API Endpoint

**Example: "Add API to get patient statistics"**

**Location:** `app/api/patients/stats/route.js`

**Template:**
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function GET(request) {
  try {
    // Query database
    const stats = await sql`
      SELECT COUNT(*) as total_patients
      FROM patients
    `
    
    return NextResponse.json({ 
      success: true, 
      data: stats[0] 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email } = body
    
    // Insert into database
    const result = await sql`
      INSERT INTO patients (name, email)
      VALUES (${name}, ${email})
      RETURNING *
    `
    
    return NextResponse.json({ 
      success: true, 
      data: result[0] 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

---

### 3. Adding Database Tables/Columns

**Example: "Add a medications table"**

**Location:** `scripts/XXX_create_medications_table.sql`

**Template:**
\`\`\`sql
-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  dosage VARCHAR(100),
  patient_id INTEGER REFERENCES patients(id),
  prescribed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX idx_medications_patient ON medications(patient_id);
\`\`\`

**To add a column to existing table:**
\`\`\`sql
ALTER TABLE appointments 
ADD COLUMN notes TEXT;
\`\`\`

---

### 4. Adding a New Component

**Example: "Create a PatientCard component"**

**Location:** `components/patient-card.jsx`

**Template:**
\`\`\`jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PatientCard({ patient, onEdit, onDelete }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{patient.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{patient.email}</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => onEdit(patient)}>Edit</Button>
          <Button variant="destructive" onClick={() => onDelete(patient.id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
\`\`\`

---

## 🔧 Common Code Patterns in Your System

### Database Queries (Neon PostgreSQL)

\`\`\`javascript
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL)

// SELECT
const users = await sql`SELECT * FROM users WHERE role = ${role}`

// INSERT
const result = await sql`
  INSERT INTO appointments (patient_name, doctor_id, date, time)
  VALUES (${name}, ${doctorId}, ${date}, ${time})
  RETURNING *
`

// UPDATE
await sql`
  UPDATE appointments 
  SET status = ${status}
  WHERE id = ${id}
`

// DELETE
await sql`DELETE FROM appointments WHERE id = ${id}`

// JOIN
const appointments = await sql`
  SELECT a.*, u.name as doctor_name
  FROM appointments a
  JOIN users u ON a.doctor_id = u.id
  WHERE a.patient_id = ${patientId}
`

// COUNT
const count = await sql`SELECT COUNT(*) as total FROM appointments`

// WHERE with multiple conditions
const results = await sql`
  SELECT * FROM appointments 
  WHERE status = ${status} 
  AND date >= ${startDate}
  ORDER BY date DESC
`
\`\`\`

---

### Form Handling Pattern

\`\`\`jsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: ''
})

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  })
}

const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    const result = await response.json()
    
    if (result.success) {
      // Success handling
      alert('Success!')
      setFormData({ name: '', email: '', phone: '' }) // Reset form
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Error: ' + error.message)
  }
}

return (
  <form onSubmit={handleSubmit}>
    <Input 
      name="name" 
      value={formData.name} 
      onChange={handleChange}
      placeholder="Name"
    />
    <Button type="submit">Submit</Button>
  </form>
)
\`\`\`

---

### Data Fetching Pattern

\`\`\`jsx
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  fetchData()
}, [])

const fetchData = async () => {
  try {
    setLoading(true)
    const response = await fetch('/api/endpoint')
    const result = await response.json()
    
    if (result.success) {
      setData(result.data)
    } else {
      setError(result.error)
    }
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}

if (loading) return <div>Loading...</div>
if (error) return <div>Error: {error}</div>
\`\`\`

---

## 🚨 Common Problems & Solutions

| Problem | Where to Look | Solution |
|---------|---------------|----------|
| Add new user role | `middleware.ts` | Add role to roleRoutes object |
| Change sidebar menu | `components/admin-sidebar.tsx` | Update navigation array |
| Fix login redirect | `app/api/login/route.js` | Check JWT token creation |
| Add form validation | Component file | Add validation before fetch |
| Database error | `scripts/` folder | Check SQL syntax, run migration |
| 404 on API route | `app/api/` folder | Check file naming: `route.js` |
| Styling issues | Component file | Use Tailwind classes |
| CORS errors | API route | Add proper headers |
| State not updating | Component | Check useState and useEffect |
| Data not showing | Component | Check console for API errors |

---

## 📝 Quick Checklist for Adding Features

For any new feature, ask yourself:

1. **Does it need a database table?** → Create SQL script in `scripts/`
2. **Does it need an API?** → Create `route.js` in `app/api/`
3. **Does it need a page?** → Create `page.jsx` in appropriate folder
4. **Does it need authentication?** → Check `middleware.ts` protects the route
5. **Does it need a component?** → Create in `components/`
6. **Does it need navigation?** → Update sidebar component

---

## 🎨 UI Components Available (shadcn/ui)

You have these pre-built components ready to use:

\`\`\`jsx
// Buttons
import { Button } from "@/components/ui/button"
<Button>Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>

// Cards
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>

// Forms
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// Select
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
<Select onValueChange={(value) => console.log(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>

// Dialog (Modal)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content here</p>
  </DialogContent>
</Dialog>

// Table
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// Badge
import { Badge } from "@/components/ui/badge"
<Badge>New</Badge>
<Badge variant="destructive">Urgent</Badge>

// Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
\`\`\`

---

## 🔐 Authentication & Authorization

Your system uses JWT tokens stored in cookies.

### To protect a route
It's already handled by `middleware.ts`:
- Admin routes: `/admin/*`
- Doctor routes: `/doctor/*`
- Staff routes: `/staff/*`

### To get current user in API

\`\`\`javascript
import jwt from 'jsonwebtoken'

export async function GET(request) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const userId = decoded.id
    const userRole = decoded.role
    
    // Use userId and userRole in your logic
    const data = await sql`SELECT * FROM table WHERE user_id = ${userId}`
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
\`\`\`

---

## 💡 Tips for the Skills Test

1. **Read the problem carefully** - Understand what feature they want
2. **Identify the type** - Is it a page, API, database change, or component?
3. **Follow existing patterns** - Look at similar features in the codebase
4. **Test as you go** - Use `console.log()` to debug
5. **Check the database** - Make sure tables exist before querying
6. **Use existing components** - Don't rebuild what's already there
7. **Keep it simple** - Don't over-engineer the solution
8. **Check for errors** - Open browser console (F12) to see errors
9. **Start with the database** - If you need data, create the table first
10. **Test the API** - Make sure API works before building the UI

---

## 🗄️ Your Current Database Tables

### users
\`\`\`sql
id SERIAL PRIMARY KEY
username VARCHAR(255) UNIQUE
email VARCHAR(255) UNIQUE
password VARCHAR(255)
name VARCHAR(255)
role VARCHAR(50) -- 'admin', 'doctor', 'staff'
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
\`\`\`

### appointments
\`\`\`sql
id SERIAL PRIMARY KEY
patient_name VARCHAR(255)
patient_email VARCHAR(255)
patient_phone VARCHAR(20)
doctor_id INTEGER REFERENCES users(id)
date DATE
time TIME
reason TEXT
status VARCHAR(50) -- 'pending', 'confirmed', 'completed', 'cancelled'
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
\`\`\`

### doctors
\`\`\`sql
id SERIAL PRIMARY KEY
name VARCHAR(255)
specialization VARCHAR(255)
available BOOLEAN DEFAULT true
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
\`\`\`

---

## 🔍 Debugging Tips

### Check Browser Console
Press F12 to open developer tools and check:
- Console tab for JavaScript errors
- Network tab for API request/response

### Add Debug Logs
\`\`\`javascript
console.log('Data received:', data)
console.log('Form values:', formData)
console.log('API response:', result)
\`\`\`

### Common Errors

**"Cannot read property of undefined"**
- Check if data exists before accessing: `data?.property`

**"Failed to fetch"**
- Check API route exists and is spelled correctly
- Check if API is returning proper JSON

**"Unexpected token in JSON"**
- API might be returning HTML error page instead of JSON
- Check API for errors

---

## 📋 Step-by-Step: Adding a Complete Feature

### Example: Add "Patient Medical Records" Feature

#### Step 1: Create Database Table
File: `scripts/010_create_medical_records.sql`
\`\`\`sql
CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255),
  diagnosis TEXT,
  treatment TEXT,
  doctor_id INTEGER REFERENCES users(id),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Step 2: Create API Endpoints
File: `app/api/medical-records/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// GET all records
export async function GET() {
  try {
    const records = await sql`
      SELECT mr.*, u.name as doctor_name
      FROM medical_records mr
      LEFT JOIN users u ON mr.doctor_id = u.id
      ORDER BY mr.date DESC
    `
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST new record
export async function POST(request) {
  try {
    const body = await request.json()
    const { patient_name, patient_email, diagnosis, treatment, doctor_id } = body
    
    const result = await sql`
      INSERT INTO medical_records (patient_name, patient_email, diagnosis, treatment, doctor_id)
      VALUES (${patient_name}, ${patient_email}, ${diagnosis}, ${treatment}, ${doctor_id})
      RETURNING *
    `
    
    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
\`\`\`

#### Step 3: Create the Page
File: `app/admin/medical-records/page.jsx`
\`\`\`jsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_email: '',
    diagnosis: '',
    treatment: '',
    doctor_id: ''
  })

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/medical-records')
      const result = await response.json()
      if (result.success) {
        setRecords(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      if (result.success) {
        alert('Record added successfully!')
        fetchRecords()
        setFormData({ patient_name: '', patient_email: '', diagnosis: '', treatment: '', doctor_id: '' })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Patient Name</Label>
              <Input 
                value={formData.patient_name}
                onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Patient Email</Label>
              <Input 
                type="email"
                value={formData.patient_email}
                onChange={(e) => setFormData({...formData, patient_email: e.target.value})}
              />
            </div>
            <div>
              <Label>Diagnosis</Label>
              <Input 
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Treatment</Label>
              <Input 
                value={formData.treatment}
                onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                required
              />
            </div>
            <Button type="submit">Add Record</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.patient_name}</TableCell>
                    <TableCell>{record.diagnosis}</TableCell>
                    <TableCell>{record.treatment}</TableCell>
                    <TableCell>{record.doctor_name}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

#### Step 4: Add to Navigation
File: `components/admin-sidebar.tsx`
Add to the navigation array:
\`\`\`typescript
{
  name: "Medical Records",
  href: "/admin/medical-records",
  icon: FileText
}
\`\`\`

---

## 🎓 Practice Scenarios

### SCENARIO 1: Patient Management System

#### File 1: Database Script
**Location:** `scripts/010_create_patients_table.sql`
\`\`\`sql
-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  blood_type VARCHAR(5),
  allergies TEXT,
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);
\`\`\`

#### File 2: API Route - GET & POST
**Location:** `app/api/patients/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// GET all patients
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    let patients
    if (search) {
      // Search by name, email, or phone
      patients = await sql`
        SELECT * FROM patients 
        WHERE name ILIKE ${'%' + search + '%'} 
        OR email ILIKE ${'%' + search + '%'}
        OR phone ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC
      `
    } else {
      patients = await sql`SELECT * FROM patients ORDER BY created_at DESC`
    }
    
    return NextResponse.json({ success: true, data: patients })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST new patient
export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      name, email, phone, date_of_birth, gender, 
      address, blood_type, allergies, emergency_contact, emergency_phone 
    } = body
    
    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }
    
    const result = await sql`
      INSERT INTO patients (
        name, email, phone, date_of_birth, gender, 
        address, blood_type, allergies, emergency_contact, emergency_phone
      )
      VALUES (
        ${name}, ${email}, ${phone}, ${date_of_birth}, ${gender},
        ${address}, ${blood_type}, ${allergies}, ${emergency_contact}, ${emergency_phone}
      )
      RETURNING *
    `
    
    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

#### File 3: API Route - UPDATE & DELETE
**Location:** `app/api/patients/[id]/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// GET single patient
export async function GET(request, { params }) {
  try {
    const { id } = params
    const patient = await sql`SELECT * FROM patients WHERE id = ${id}`
    
    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: patient[0] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT update patient
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { 
      name, email, phone, date_of_birth, gender, 
      address, blood_type, allergies, emergency_contact, emergency_phone 
    } = body
    
    const result = await sql`
      UPDATE patients 
      SET 
        name = ${name},
        email = ${email},
        phone = ${phone},
        date_of_birth = ${date_of_birth},
        gender = ${gender},
        address = ${address},
        blood_type = ${blood_type},
        allergies = ${allergies},
        emergency_contact = ${emergency_contact},
        emergency_phone = ${emergency_phone},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    
    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE patient
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await sql`DELETE FROM patients WHERE id = ${id}`
    
    return NextResponse.json({ success: true, message: 'Patient deleted' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

#### File 4: Main Page
**Location:** `app/admin/patients/page.jsx`
\`\`\`jsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    blood_type: '',
    allergies: '',
    emergency_contact: '',
    emergency_phone: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async (search = '') => {
    try {
      setLoading(true)
      const url = search ? `/api/patients?search=${search}` : '/api/patients'
      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setPatients(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error fetching patients')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    fetchPatients(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingPatient ? `/api/patients/${editingPatient.id}` : '/api/patients'
      const method = editingPatient ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      if (result.success) {
        alert(editingPatient ? 'Patient updated!' : 'Patient added!')
        setIsDialogOpen(false)
        resetForm()
        fetchPatients()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving patient')
    }
  }

  const handleEdit = (patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender || '',
      address: patient.address || '',
      blood_type: patient.blood_type || '',
      allergies: patient.allergies || '',
      emergency_contact: patient.emergency_contact || '',
      emergency_phone: patient.emergency_phone || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this patient?')) return
    
    try {
      const response = await fetch(`/api/patients/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        alert('Patient deleted!')
        fetchPatients()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting patient')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      address: '',
      blood_type: '',
      allergies: '',
      emergency_contact: '',
      emergency_phone: ''
    })
    setEditingPatient(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add New Patient</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input 
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Input 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    placeholder="Male/Female/Other"
                  />
                </div>
                <div>
                  <Label>Blood Type</Label>
                  <Input 
                    value={formData.blood_type}
                    onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                    placeholder="A+, B+, O+, etc."
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <Label>Allergies</Label>
                <Input 
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  placeholder="List any allergies"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Emergency Contact</Label>
                  <Input 
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Emergency Phone</Label>
                  <Input 
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingPatient ? 'Update' : 'Add'} Patient</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <Input 
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Patients ({patients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : patients.length === 0 ? (
            <p>No patients found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.blood_type}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEdit(patient)}>
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(patient.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

---

### SCENARIO 2: Search & Filter Appointments

#### File: Enhanced Appointments Page with Search
**Location:** `app/admin/appointments/page.jsx`
\`\`\`jsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('all')
  
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [appointments, searchTerm, statusFilter, dateFilter, doctorFilter])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      const result = await response.json()
      if (result.success) {
        setAppointments(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors')
      const result = await response.json()
      if (result.success) {
        setDoctors(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...appointments]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient_phone?.includes(searchTerm)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(apt => apt.date === dateFilter)
    }

    // Doctor filter
    if (doctorFilter !== 'all') {
      filtered = filtered.filter(apt => apt.doctor_id === parseInt(doctorFilter))
    }

    setFilteredAppointments(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDateFilter('')
    setDoctorFilter('all')
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'default',
      confirmed: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Appointments</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input 
                placeholder="Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Appointments ({filteredAppointments.length} of {appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : filteredAppointments.length === 0 ? (
            <p>No appointments found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.patient_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{apt.patient_email}</div>
                        <div className="text-muted-foreground">{apt.patient_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{apt.doctor_name}</TableCell>
                    <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                    <TableCell>{apt.time}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell>{apt.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

---

### SCENARIO 3: Appointment Reports & Statistics

#### File 1: Reports API
**Location:** `app/api/reports/appointments/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Total appointments
    const totalResult = await sql`
      SELECT COUNT(*) as total FROM appointments
      WHERE date BETWEEN ${startDate} AND ${endDate}
    `

    // By status
    const byStatus = await sql`
      SELECT status, COUNT(*) as count
      FROM appointments
      WHERE date BETWEEN ${startDate} AND ${endDate}
      GROUP BY status
    `

    // By doctor
    const byDoctor = await sql`
      SELECT u.name as doctor_name, COUNT(*) as count
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      WHERE a.date BETWEEN ${startDate} AND ${endDate}
      GROUP BY u.name
      ORDER BY count DESC
    `

    // Daily trend
    const dailyTrend = await sql`
      SELECT date, COUNT(*) as count
      FROM appointments
      WHERE date BETWEEN ${startDate} AND ${endDate}
      GROUP BY date
      ORDER BY date
    `

    return NextResponse.json({
      success: true,
      data: {
        total: parseInt(totalResult[0].total),
        byStatus,
        byDoctor,
        dailyTrend
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

#### File 2: Reports Page
**Location:** `app/admin/reports/page.jsx`
\`\`\`jsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }, [])

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select date range')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(
        `/api/reports/appointments?startDate=${startDate}&endDate=${endDate}`
      )
      const result = await response.json()
      
      if (result.success) {
        setReportData(result.data)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating report')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    let csv = 'Appointment Report\n\n'
    csv += `Period: ${startDate} to ${endDate}\n\n`
    csv += `Total Appointments: ${reportData.total}\n\n`
    
    csv += 'By Status:\n'
    csv += 'Status,Count\n'
    reportData.byStatus.forEach(item => {
      csv += `${item.status},${item.count}\n`
    })
    
    csv += '\nBy Doctor:\n'
    csv += 'Doctor,Count\n'
    reportData.byDoctor.forEach(item => {
      csv += `${item.doctor_name},${item.count}\n`
    })

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointment-report-${startDate}-to-${endDate}.csv`
    a.click()
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Appointment Reports</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{reportData.total}</p>
              </CardContent>
            </Card>
            
            {reportData.byStatus.map(item => (
              <Card key={item.status}>
                <CardHeader>
                  <CardTitle className="text-sm capitalize">{item.status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{item.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Appointments by Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reportData.byDoctor.map(item => (
                  <div key={item.doctor_name} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{item.doctor_name}</span>
                    <span className="text-2xl font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {reportData.dailyTrend.map(item => (
                  <div key={item.date} className="flex justify-between text-sm">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <span className="font-medium">{item.count} appointments</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button onClick={exportToCSV}>Export to CSV</Button>
          </div>
        </>
      )}
    </div>
  )
}
\`\`\`

---

### SCENARIO 4: Add Notes/Diagnosis to Appointments

#### File 1: Update Database
**Location:** `scripts/011_add_appointment_notes.sql`
\`\`\`sql
-- Add columns for medical notes
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS diagnosis TEXT,
ADD COLUMN IF NOT EXISTS prescription TEXT,
ADD COLUMN IF NOT EXISTS doctor_notes TEXT,
ADD COLUMN IF NOT EXISTS follow_up_date DATE;
\`\`\`

#### File 2: Update Appointment API
**Location:** `app/api/appointments/[id]/notes/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { diagnosis, prescription, doctor_notes, follow_up_date } = body

    const result = await sql`
      UPDATE appointments 
      SET 
        diagnosis = ${diagnosis},
        prescription = ${prescription},
        doctor_notes = ${doctor_notes},
        follow_up_date = ${follow_up_date},
        status = 'completed'
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

#### File 3: Doctor Notes Dialog Component
**Location:** `components/appointment-notes-dialog.jsx`
\`\`\`jsx
"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function AppointmentNotesDialog({ appointment, open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState({
    diagnosis: appointment?.diagnosis || '',
    prescription: appointment?.prescription || '',
    doctor_notes: appointment?.doctor_notes || '',
    follow_up_date: appointment?.follow_up_date || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      if (result.success) {
        alert('Notes saved successfully!')
        onSave()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving notes')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Medical Notes - {appointment?.patient_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Diagnosis</Label>
            <Textarea 
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              placeholder="Enter diagnosis..."
              rows={3}
            />
          </div>
          <div>
            <Label>Prescription</Label>
            <Textarea 
              value={formData.prescription}
              onChange={(e) => setFormData({...formData, prescription: e.target.value})}
              placeholder="Enter prescription..."
              rows={3}
            />
          </div>
          <div>
            <Label>Doctor Notes</Label>
            <Textarea 
              value={formData.doctor_notes}
              onChange={(e) => setFormData({...formData, doctor_notes: e.target.value})}
              placeholder="Additional notes..."
              rows={4}
            />
          </div>
          <div>
            <Label>Follow-up Date</Label>
            <Input 
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Notes</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
\`\`\`

---

### SCENARIO 5: Patient Appointment History

#### File: Patient History API
**Location:** `app/api/patients/[email]/history/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function GET(request, { params }) {
  try {
    const { email } = params
    
    const appointments = await sql`
      SELECT 
        a.*,
        u.name as doctor_name,
        u.email as doctor_email
      FROM appointments a
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.patient_email = ${email}
      ORDER BY a.date DESC, a.time DESC
    `

    return NextResponse.json({ success: true, data: appointments })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

#### File: Patient History Page
**Location:** `app/admin/patient-history/page.jsx`
\`\`\`jsx
"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function PatientHistoryPage() {
  const [email, setEmail] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const searchHistory = async () => {
    if (!email) {
      alert('Please enter patient email')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/patients/${encodeURIComponent(email)}/history`)
      const result = await response.json()
      
      if (result.success) {
        setHistory(result.data)
        setSearched(true)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error fetching history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'default',
      confirmed: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Patient Appointment History</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Patient Email</Label>
              <Input 
                type="email"
                placeholder="Enter patient email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchHistory()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchHistory} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>
              Appointment History for {email} ({history.length} appointments)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p>No appointments found for this patient</p>
            ) : (
              <div className="space-y-4">
                {history.map((apt) => (
                  <Card key={apt.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Date & Time</p>
                          <p className="font-medium">
                            {new Date(apt.date).toLocaleDateString()} at {apt.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Doctor</p>
                          <p className="font-medium">{apt.doctor_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <div>{getStatusBadge(apt.status)}</div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Reason</p>
                          <p className="font-medium">{apt.reason}</p>
                        </div>
                        {apt.diagnosis && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Diagnosis</p>
                            <p className="font-medium">{apt.diagnosis}</p>
                          </div>
                        )}
                        {apt.prescription && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Prescription</p>
                            <p className="font-medium">{apt.prescription}</p>
                          </div>
                        )}
                        {apt.doctor_notes && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Doctor Notes</p>
                            <p className="font-medium">{apt.doctor_notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
\`\`\`

---

## 👯 COMPLETE TEMPLATE FILES - COPY & PASTE READY

### SCENARIO 1: Patient Management System

#### File 1: Database Script
**Location:** `scripts/010_create_patients_table.sql`
\`\`\`sql
-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  blood_type VARCHAR(5),
  allergies TEXT,
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);
\`\`\`

#### File 2: API Route - GET & POST
**Location:** `app/api/patients/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// GET all patients
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    let patients
    if (search) {
      // Search by name, email, or phone
      patients = await sql`
        SELECT * FROM patients 
        WHERE name ILIKE ${'%' + search + '%'} 
        OR email ILIKE ${'%' + search + '%'}
        OR phone ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC
      `
    } else {
      patients = await sql`SELECT * FROM patients ORDER BY created_at DESC`
    }
    
    return NextResponse.json({ success: true, data: patients })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST new patient
export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      name, email, phone, date_of_birth, gender, 
      address, blood_type, allergies, emergency_contact, emergency_phone 
    } = body
    
    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }
    
    const result = await sql`
      INSERT INTO patients (
        name, email, phone, date_of_birth, gender, 
        address, blood_type, allergies, emergency_contact, emergency_phone
      )
      VALUES (
        ${name}, ${email}, ${phone}, ${date_of_birth}, ${gender},
        ${address}, ${blood_type}, ${allergies}, ${emergency_contact}, ${emergency_phone}
      )
      RETURNING *
    `
    
    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

#### File 3: API Route - UPDATE & DELETE
**Location:** `app/api/patients/[id]/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// GET single patient
export async function GET(request, { params }) {
  try {
    const { id } = params
    const patient = await sql`SELECT * FROM patients WHERE id = ${id}`
    
    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: patient[0] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT update patient
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { 
      name, email, phone, date_of_birth, gender, 
      address, blood_type, allergies, emergency_contact, emergency_phone 
    } = body
    
    const result = await sql`
      UPDATE patients 
      SET 
        name = ${name},
        email = ${email},
        phone = ${phone},
        date_of_birth = ${date_of_birth},
        gender = ${gender},
        address = ${address},
        blood_type = ${blood_type},
        allergies = ${allergies},
        emergency_contact = ${emergency_contact},
        emergency_phone = ${emergency_phone},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    
    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE patient
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await sql`DELETE FROM patients WHERE id = ${id}`
    
    return NextResponse.json({ success: true, message: 'Patient deleted' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

#### File 4: Main Page
**Location:** `app/admin/patients/page.jsx`
\`\`\`jsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    blood_type: '',
    allergies: '',
    emergency_contact: '',
    emergency_phone: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async (search = '') => {
    try {
      setLoading(true)
      const url = search ? `/api/patients?search=${search}` : '/api/patients'
      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setPatients(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error fetching patients')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    fetchPatients(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingPatient ? `/api/patients/${editingPatient.id}` : '/api/patients'
      const method = editingPatient ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      if (result.success) {
        alert(editingPatient ? 'Patient updated!' : 'Patient added!')
        setIsDialogOpen(false)
        resetForm()
        fetchPatients()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving patient')
    }
  }

  const handleEdit = (patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender || '',
      address: patient.address || '',
      blood_type: patient.blood_type || '',
      allergies: patient.allergies || '',
      emergency_contact: patient.emergency_contact || '',
      emergency_phone: patient.emergency_phone || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this patient?')) return
    
    try {
      const response = await fetch(`/api/patients/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        alert('Patient deleted!')
        fetchPatients()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting patient')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      address: '',
      blood_type: '',
      allergies: '',
      emergency_contact: '',
      emergency_phone: ''
    })
    setEditingPatient(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add New Patient</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input 
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Input 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    placeholder="Male/Female/Other"
                  />
                </div>
                <div>
                  <Label>Blood Type</Label>
                  <Input 
                    value={formData.blood_type}
                    onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                    placeholder="A+, B+, O+, etc."
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <Label>Allergies</Label>
                <Input 
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  placeholder="List any allergies"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Emergency Contact</Label>
                  <Input 
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Emergency Phone</Label>
                  <Input 
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingPatient ? 'Update' : 'Add'} Patient</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <Input 
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Patients ({patients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : patients.length === 0 ? (
            <p>No patients found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.blood_type}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEdit(patient)}>
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(patient.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

---

### SCENARIO 2: Search & Filter Appointments

#### File: Enhanced Appointments Page with Search
**Location:** `app/admin/appointments/page.jsx`
\`\`\`jsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('all')
  
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [appointments, searchTerm, statusFilter, dateFilter, doctorFilter])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      const result = await response.json()
      if (result.success) {
        setAppointments(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors')
      const result = await response.json()
      if (result.success) {
        setDoctors(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...appointments]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient_phone?.includes(searchTerm)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(apt => apt.date === dateFilter)
    }

    // Doctor filter
    if (doctorFilter !== 'all') {
      filtered = filtered.filter(apt => apt.doctor_id === parseInt(doctorFilter))
    }

    setFilteredAppointments(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDateFilter('')
    setDoctorFilter('all')
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'default',
      confirmed: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Appointments</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input 
                placeholder="Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Appointments ({filteredAppointments.length} of {appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : filteredAppointments.length === 0 ? (
            <p>No appointments found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.patient_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{apt.patient_email}</div>
                        <div className="text-muted-foreground">{apt.patient_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{apt.doctor_name}</TableCell>
                    <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                    <TableCell>{apt.time}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell>{apt.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

---

### SCENARIO 3: Appointment Reports & Statistics

#### File 1: Reports API
**Location:** `app/api/reports/appointments/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Total appointments
    const totalResult = await sql`
      SELECT COUNT(*) as total FROM appointments
      WHERE date BETWEEN ${startDate} AND ${endDate}
    `

    // By status
    const byStatus = await sql`
      SELECT status, COUNT(*) as count
      FROM appointments
      WHERE date BETWEEN ${startDate} AND ${endDate}
      GROUP BY status
    `

    // By doctor
    const byDoctor = await sql`
      SELECT u.name as doctor_name, COUNT(*) as count
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      WHERE a.date BETWEEN ${startDate} AND ${endDate}
      GROUP BY u.name
      ORDER BY count DESC
    `

    // Daily trend
    const dailyTrend = await sql`
      SELECT date, COUNT(*) as count
      FROM appointments
      WHERE date BETWEEN ${startDate} AND ${endDate}
      GROUP BY date
      ORDER BY date
    `

    return NextResponse.json({
      success: true,
      data: {
        total: parseInt(totalResult[0].total),
        byStatus,
        byDoctor,
        dailyTrend
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

#### File 2: Reports Page
**Location:** `app/admin/reports/page.jsx`
\`\`\`jsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }, [])

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select date range')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(
        `/api/reports/appointments?startDate=${startDate}&endDate=${endDate}`
      )
      const result = await response.json()
      
      if (result.success) {
        setReportData(result.data)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating report')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    let csv = 'Appointment Report\n\n'
    csv += `Period: ${startDate} to ${endDate}\n\n`
    csv += `Total Appointments: ${reportData.total}\n\n`
    
    csv += 'By Status:\n'
    csv += 'Status,Count\n'
    reportData.byStatus.forEach(item => {
      csv += `${item.status},${item.count}\n`
    })
    
    csv += '\nBy Doctor:\n'
    csv += 'Doctor,Count\n'
    reportData.byDoctor.forEach(item => {
      csv += `${item.doctor_name},${item.count}\n`
    })

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointment-report-${startDate}-to-${endDate}.csv`
    a.click()
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Appointment Reports</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{reportData.total}</p>
              </CardContent>
            </Card>
            
            {reportData.byStatus.map(item => (
              <Card key={item.status}>
                <CardHeader>
                  <CardTitle className="text-sm capitalize">{item.status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{item.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Appointments by Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reportData.byDoctor.map(item => (
                  <div key={item.doctor_name} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{item.doctor_name}</span>
                    <span className="text-2xl font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {reportData.dailyTrend.map(item => (
                  <div key={item.date} className="flex justify-between text-sm">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <span className="font-medium">{item.count} appointments</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button onClick={exportToCSV}>Export to CSV</Button>
          </div>
        </>
      )}
    </div>
  )
}
\`\`\`

---

### SCENARIO 4: Add Notes/Diagnosis to Appointments

#### File 1: Update Database
**Location:** `scripts/011_add_appointment_notes.sql`
\`\`\`sql
-- Add columns for medical notes
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS diagnosis TEXT,
ADD COLUMN IF NOT EXISTS prescription TEXT,
ADD COLUMN IF NOT EXISTS doctor_notes TEXT,
ADD COLUMN IF NOT EXISTS follow_up_date DATE;
\`\`\`

#### File 2: Update Appointment API
**Location:** `app/api/appointments/[id]/notes/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { diagnosis, prescription, doctor_notes, follow_up_date } = body

    const result = await sql`
      UPDATE appointments 
      SET 
        diagnosis = ${diagnosis},
        prescription = ${prescription},
        doctor_notes = ${doctor_notes},
        follow_up_date = ${follow_up_date},
        status = 'completed'
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

#### File 3: Doctor Notes Dialog Component
**Location:** `components/appointment-notes-dialog.jsx`
\`\`\`jsx
"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function AppointmentNotesDialog({ appointment, open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState({
    diagnosis: appointment?.diagnosis || '',
    prescription: appointment?.prescription || '',
    doctor_notes: appointment?.doctor_notes || '',
    follow_up_date: appointment?.follow_up_date || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      if (result.success) {
        alert('Notes saved successfully!')
        onSave()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving notes')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Medical Notes - {appointment?.patient_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Diagnosis</Label>
            <Textarea 
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              placeholder="Enter diagnosis..."
              rows={3}
            />
          </div>
          <div>
            <Label>Prescription</Label>
            <Textarea 
              value={formData.prescription}
              onChange={(e) => setFormData({...formData, prescription: e.target.value})}
              placeholder="Enter prescription..."
              rows={3}
            />
          </div>
          <div>
            <Label>Doctor Notes</Label>
            <Textarea 
              value={formData.doctor_notes}
              onChange={(e) => setFormData({...formData, doctor_notes: e.target.value})}
              placeholder="Additional notes..."
              rows={4}
            />
          </div>
          <div>
            <Label>Follow-up Date</Label>
            <Input 
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save Notes</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
\`\`\`

---

### SCENARIO 5: Patient Appointment History

#### File: Patient History API
**Location:** `app/api/patients/[email]/history/route.js`
\`\`\`javascript
import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function GET(request, { params }) {
  try {
    const { email } = params
    
    const appointments = await sql`
      SELECT 
        a.*,
        u.name as doctor_name,
        u.email as doctor_email
      FROM appointments a
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.patient_email = ${email}
      ORDER BY a.date DESC, a.time DESC
    `

    return NextResponse.json({ success: true, data: appointments })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
\`\`\`

#### File: Patient History Page
**Location:** `app/admin/patient-history/page.jsx`
\`\`\`jsx
"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function PatientHistoryPage() {
  const [email, setEmail] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const searchHistory = async () => {
    if (!email) {
      alert('Please enter patient email')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/patients/${encodeURIComponent(email)}/history`)
      const result = await response.json()
      
      if (result.success) {
        setHistory(result.data)
        setSearched(true)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error fetching history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'default',
      confirmed: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Patient Appointment History</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Patient Email</Label>
              <Input 
                type="email"
                placeholder="Enter patient email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchHistory()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchHistory} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>
              Appointment History for {email} ({history.length} appointments)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p>No appointments found for this patient</p>
            ) : (
              <div className="space-y-4">
                {history.map((apt) => (
                  <Card key={apt.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Date & Time</p>
                          <p className="font-medium">
                            {new Date(apt.date).toLocaleDateString()} at {apt.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Doctor</p>
                          <p className="font-medium">{apt.doctor_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <div>{getStatusBadge(apt.status)}</div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Reason</p>
                          <p className="font-medium">{apt.reason}</p>
                        </div>
                        {apt.diagnosis && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Diagnosis</p>
                            <p className="font-medium">{apt.diagnosis}</p>
                          </div>
                        )}
                        {apt.prescription && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Prescription</p>
                            <p className="font-medium">{apt.prescription}</p>
                          </div>
                        )}
                        {apt.doctor_notes && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Doctor Notes</p>
                            <p className="font-medium">{apt.doctor_notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
\`\`\`

---

## 🎯 QUICK DECISION TREE

**When teacher gives you a problem, ask yourself:**

1. **Does it involve storing new data?**
   - YES → Create database table first (`scripts/XXX_table.sql`)
   - NO → Skip to step 2

2. **Does it need to fetch/save data?**
   - YES → Create API route (`app/api/[feature]/route.js`)
   - NO → Skip to step 3

3. **Does it need a user interface?**
   - YES → Create page (`app/admin/[feature]/page.jsx`)
   - NO → You're done!

4. **Does it need to appear in menu?**
   - YES → Update sidebar component
   - NO → You're done!

---

## ⚡ EMERGENCY QUICK FIXES

### Fix: "Cannot find module"
\`\`\`bash
# Check if file exists and path is correct
# Use exact path from error message
\`\`\`

### Fix: "Database table doesn't exist"
\`\`\`sql
-- Check table name spelling
-- Run the CREATE TABLE script
\`\`\`

### Fix: "API returns 404"
\`\`\`javascript
// Check file is named: route.js (not api.js or index.js)
// Check folder structure matches URL
\`\`\`

### Fix: "Data not showing"
\`\`\`javascript
// Add console.log to check:
console.log('API response:', result)
console.log('Data:', data)
// Check browser console (F12) for errors
\`\`\`

---

**Remember: Copy these templates, modify the names/fields to match your problem, and test step by step!**

Good luck! 🚀
\`\`\`

---

## 🎓 Practice Scenarios

Try implementing these on your own for practice:

1. **Add a "Prescriptions" feature**
   - Table: prescriptions (id, patient_name, medication, dosage, doctor_id, date)
   - API: GET and POST endpoints
   - Page: List and add prescriptions

2. **Add "Doctor Schedule" feature**
   - Table: schedules (id, doctor_id, day_of_week, start_time, end_time)
   - API: CRUD operations
   - Page: Manage doctor schedules

3. **Add "Patient History" feature**
   - Use existing appointments table
   - API: Get appointments by patient email
   - Page: Search and view patient history

4. **Add "Statistics Dashboard"**
   - No new table needed
   - API: Aggregate queries (COUNT, SUM, etc.)
   - Page: Display charts and stats

---

## 🚀 Quick Reference Commands

### Run the development server
\`\`\`bash
npm run dev
\`\`\`

### Access the application
\`\`\`
http://localhost:3000
\`\`\`

### Test credentials
- Admin: zealjan@gmail.com / capstone2
- Doctor: drwilson@clinic.com / doctor123
- Staff: staff1 / password123

---

Good luck with your skills test!

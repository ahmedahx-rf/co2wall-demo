import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { KnobModule } from 'primeng/knob';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface SensorReading {
    name: string;
    id: string;
    location: string;
    value: number;
    unit: string;
    min: number;
    max: number;
    valveOpen?: boolean;
    moisture?: number;
    temperature?: number;
    humidity?: number;
}

@Component({
    selector: 'app-monitoring',
    standalone: true,
    imports: [CommonModule, TabViewModule, KnobModule, CardModule, FormsModule, InputSwitchModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <!-- Metadata Section -->
        <div class="mb-4 p-4 card rounded-lg shadow">
            <div class="flex justify-between">
                <div class="space-y-2">
                    <h2 class="text-2xl font-bold">{{ locationName }}</h2>
                    <div class="flex gap-4 text-sm ">
                        <span>ID: {{ locationId }}</span>
                        <span>•</span>
                        <span>Country: {{ country }}</span>
                        <span>•</span>
                        <span>City: {{ city }}</span>
                        <span>•</span>
                        <span>Sectors: {{ sectotrs }}</span>
                        <span>•</span>
                        <span>GPS: {{ gpsCoordinates }}</span>
                        <span>•</span>
                        <span>Temperature: {{ temperature }} °C</span>
                        <span>•</span>
                        <span>{{ currentDate | date: 'medium' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Global Status Summary -->
        <div class="mb-4 p-4 card rounded-lg shadow">
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-semibold">Status</h3>
                <div class="px-3 py-1 rounded-full text-sm" [ngClass]="getGlobalStatusClass()">
                    {{ getGlobalStatusText() }}
                </div>
            </div>
            <div class="grid grid-cols-4 gap-4 mb-3">
                <div class="text-sm">
                    <span class="text-gray-600">Active Sectors:</span>
                    <span class="ml-2 font-medium">{{ getActiveSectors() }}/{{ sectotrs }}</span>
                </div>
                <div class="text-sm">
                    <span class="text-gray-600">Open Valves:</span>
                    <span class="ml-2 font-medium">{{ getOpenValvesCount() }}</span>
                </div>
                <div class="text-sm">
                    <span class="text-gray-600">Alerts:</span>
                    <span class="ml-2 font-medium text-red-600">{{ getAlertsCount() }}</span>
                </div>
                <div class="text-sm">
                    <span class="text-gray-600">Warnings:</span>
                    <span class="ml-2 font-medium text-yellow-600">{{ getWarningsCount() }}</span>
                </div>
            </div>
            <div class="text-sm ">
                {{ getGlobalStatusMessage() }}
            </div>
        </div>

        <!-- Tabs Section -->
        <p-tabView>
            <!-- Status Tab -->
            <p-tabPanel header="Status">
                <ng-template pTemplate="content">
                    <div class="grid lg:grid-cols-2 grid-cols-1 gap-6">
                        <!-- Left Side - Sections -->
                        <div class="space-y-4">
                            <h3 class="text-xl font-semibold mb-4">Sectors</h3>
                            <div class="grid xl:grid-cols-2 grid-cols-1 gap-4">
                                @for (sensor of pressureSensors; track sensor.name) {
                                    <div class="card p-4 rounded-lg shadow">
                                        <div class="flex flex-col gap-2 mb-4">
                                            <div class="flex justify-between items-center">
                                                <h4 class="text-lg font-medium">{{ sensor.name }}</h4>
                                                <div class="flex items-center gap-2">
                                                    <span class="text-sm text-gray-600">Valve</span>
                                                    <p-inputSwitch [(ngModel)]="sensor.valveOpen" (onChange)="onValveToggle(sensor)"></p-inputSwitch>
                                                </div>
                                            </div>
                                            <div class="flex gap-4 text-sm text-gray-600">
                                                <span>ID: {{ sensor.id }}</span>
                                                <span>•</span>
                                                <span>{{ sensor.location }}</span>
                                            </div>
                                        </div>

                                        <!-- Status Message -->
                                        <div class="mb-4 p-3 rounded-lg" [ngClass]="getSectionStatusClass(sensor)">
                                            <p class="text-sm">{{ getSectionStatusMessage(sensor) }}</p>
                                        </div>

                                        <div class="grid grid-cols-2 gap-4">
                                            <!-- First Row -->
                                            <div class="flex flex-col items-center">
                                                <p class="text-sm text-gray-600 mb-1">Pressure</p>
                                                <p-knob
                                                    [(ngModel)]="sensor.value"
                                                    [min]="sensor.min"
                                                    [max]="sensor.max"
                                                    [readonly]="true"
                                                    [strokeWidth]="5"
                                                    [size]="120"
                                                    [valueTemplate]="sensor.value.toFixed(1) + ' ' + sensor.unit"
                                                    [valueColor]="getValueColor(sensor)"
                                                ></p-knob>
                                            </div>
                                            <div class="flex flex-col items-center">
                                                <p class="text-sm text-gray-600 mb-1">Moisture</p>
                                                <p-knob
                                                    [(ngModel)]="sensor.moisture"
                                                    [min]="0"
                                                    [max]="100"
                                                    [readonly]="true"
                                                    [strokeWidth]="5"
                                                    [size]="120"
                                                    [valueTemplate]="(sensor.moisture || 0).toFixed(1) + '%'"
                                                    [valueColor]="getMoistureColor(sensor)"
                                                ></p-knob>
                                            </div>
                                            <!-- Second Row -->
                                            <div class="flex flex-col items-center">
                                                <p class="text-sm text-gray-600 mb-1">Temperature</p>
                                                <p-knob
                                                    [(ngModel)]="sensor.temperature"
                                                    [min]="15"
                                                    [max]="35"
                                                    [readonly]="true"
                                                    [strokeWidth]="5"
                                                    [size]="120"
                                                    [valueTemplate]="(sensor.temperature || 0).toFixed(1) + '°C'"
                                                    [valueColor]="getTemperatureColor(sensor)"
                                                ></p-knob>
                                            </div>
                                            <div class="flex flex-col items-center">
                                                <p class="text-sm text-gray-600 mb-1">Humidity</p>
                                                <p-knob
                                                    [(ngModel)]="sensor.humidity"
                                                    [min]="0"
                                                    [max]="100"
                                                    [readonly]="true"
                                                    [strokeWidth]="5"
                                                    [size]="120"
                                                    [valueTemplate]="(sensor.humidity || 0).toFixed(1) + '%'"
                                                    [valueColor]="getHumidityColor(sensor)"
                                                ></p-knob>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>

                        <!-- Right Side - System Status -->
                        <div class="space-y-3">
                            <h3 class="text-xl font-semibold mb-4">System Status</h3>
                            <div class="flex flex-col gap-4">
                                <!-- Water Management Block -->
                                <div class="card p-4 rounded-lg shadow">
                                    <h4 class="text-lg font-medium mb-4">Water Management</h4>
                                    <div class="flex flex-col gap-8">
                                        <div class="flex flex-col items-center">
                                            <p class="text-sm text-gray-600 mb-1">Clean Water</p>
                                            <p-knob
                                                [(ngModel)]="getSystemSensor('Clean Water').value"
                                                [min]="0"
                                                [max]="100"
                                                [readonly]="true"
                                                [strokeWidth]="5"
                                                [size]="150"
                                                [valueTemplate]="getSystemSensor('Clean Water').value.toFixed(1) + '%'"
                                                [valueColor]="getValueColor(getSystemSensor('Clean Water'))"
                                            ></p-knob>
                                        </div>

                                        <div class="flex flex-col items-center">
                                            <p class="text-sm text-gray-600 mb-1">Waste Water</p>
                                            <p-knob
                                                [(ngModel)]="getSystemSensor('Waste Water').value"
                                                [min]="0"
                                                [max]="100"
                                                [readonly]="true"
                                                [strokeWidth]="5"
                                                [size]="150"
                                                [valueTemplate]="getSystemSensor('Waste Water').value.toFixed(1) + '%'"
                                                [valueColor]="getValueColor(getSystemSensor('Waste Water'))"
                                            ></p-knob>
                                        </div>
                                    </div>
                                </div>

                                <!-- Other System Sensors -->
                                @for (sensor of getFilteredSystemSensors(); track sensor.name) {
                                    <div class="card p-4 rounded-lg shadow">
                                        <h4 class="text-lg font-medium mb-4">{{ sensor.name }}</h4>
                                        <div class="flex justify-center">
                                            <p-knob
                                                [(ngModel)]="sensor.value"
                                                [min]="sensor.min"
                                                [max]="sensor.max"
                                                [readonly]="true"
                                                [strokeWidth]="5"
                                                [size]="150"
                                                [valueTemplate]="sensor.value.toFixed(1) + ' ' + sensor.unit"
                                                [valueColor]="getValueColor(sensor)"
                                            ></p-knob>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </p-tabPanel>

            <!-- Location Tab -->
            <p-tabPanel header="Location">
                <ng-template pTemplate="content"> Location content here </ng-template>
            </p-tabPanel>

            <!-- Results Tab -->
            <p-tabPanel header="Results">
                <ng-template pTemplate="content"> Results content here </ng-template>
            </p-tabPanel>
        </p-tabView>
    `
})
export class MonitoringPage implements OnInit, OnDestroy {
    locationName = 'King Salman National Park';
    locationId = 'SAU-001';
    country = 'Saudi Arabia';
    city = 'Riyadh';
    sectotrs = 20;
    gpsCoordinates = '24.7136° N, 46.6753° E';
    temperature = 24.5;
    currentDate = new Date();
    private timeInterval: any;

    pressureSensors: SensorReading[] = [
        {
            name: 'Sector 1',
            id: 'SEC-001',
            location: 'North Garden',
            value: 4.2,
            unit: 'Bar',
            min: 0,
            max: 6,
            valveOpen: true,
            moisture: 14.5,
            temperature: 24.5,
            humidity: 45
        },
        {
            name: 'Sector 2',
            id: 'SEC-002',
            location: 'Central Plaza',
            value: 3.8,
            unit: 'Bar',
            min: 0,
            max: 6,
            valveOpen: true,
            moisture: 15,
            temperature: 25.2,
            humidity: 48
        },
        {
            name: 'Sector 3',
            id: 'SEC-003',
            location: 'Palm Area',
            value: 4.5,
            unit: 'Bar',
            min: 0,
            max: 6,
            valveOpen: true,
            moisture: 15,
            temperature: 26.1,
            humidity: 42
        },
        {
            name: 'Sector 4',
            id: 'SEC-004',
            location: "Children's Garden",
            value: 4.0,
            unit: 'Bar',
            min: 0,
            max: 6,
            valveOpen: true,
            moisture: 10,
            temperature: 25.8,
            humidity: 44
        }
    ];
    systemSensors: SensorReading[] = [
        { name: 'Waste Water', value: 10, unit: '%', min: 0, max: 100, id: 'WW-001', location: 'Treatment Plant' },
        { name: 'Clean Water', value: 78, unit: '%', min: 0, max: 100, id: 'CW-001', location: 'Storage Tank' },
        { name: 'Pollution Levels', value: 2.8, unit: '%', min: 0, max: 100, id: 'PL-001', location: 'Air Quality Station' },
        { name: 'Temperature', value: 24.5, unit: '°C', min: 15, max: 35, id: 'TEMP-001', location: 'Control Room' },
        { name: 'Voltage', value: 15, unit: 'V', min: 0, max: 25, id: 'VOLT-001', location: 'Power Supply' },
        { name: 'Humidity', value: 45, unit: '%', min: 0, max: 100, id: 'HUM-001', location: 'Control Room' }
    ];

    constructor(private messageService: MessageService) {}

    ngOnInit() {
        this.startMonitoring();
        this.startClock();
    }

    ngOnDestroy() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }

    private startClock() {
        // Update time every second
        this.timeInterval = setInterval(() => {
            this.currentDate = new Date();
        }, 1000);
    }

    private startMonitoring() {
        // Simulate real-time updates
        setInterval(() => {
            this.updateSensorReadings();
        }, 5000);
    }

    private updateSensorReadings() {
        this.pressureSensors = this.pressureSensors.map((sensor) => {
            const updatedSensor = {
                ...sensor,
                value: sensor.valveOpen ? Math.max(sensor.min, Math.min(sensor.max, sensor.value + (Math.random() - 0.5) * 0.2)) : sensor.value,
                moisture: sensor.valveOpen ? Math.max(0, Math.min(100, (sensor.moisture || 0) + (Math.random() - 0.5) * 1)) : sensor.moisture,
                temperature: Math.max(15, Math.min(35, (sensor.temperature || 24) + (Math.random() - 0.5) * 0.2)),
                humidity: Math.max(0, Math.min(100, (sensor.humidity || 45) + (Math.random() - 0.5) * 0.5))
            };

            // Check for critical status after updating values
            this.checkCriticalStatus(updatedSensor);
            return updatedSensor;
        });

        // More realistic fluctuations for system sensors
        this.systemSensors = this.systemSensors.map((sensor) => {
            let fluctuation;
            switch (sensor.name) {
                case 'Temperature':
                    fluctuation = (Math.random() - 0.5) * 0.2; // Small temperature changes
                    break;
                case 'Voltage':
                    fluctuation = (Math.random() - 0.5) * 0.4; // Small voltage fluctuations
                    break;
                case 'CO2':
                    fluctuation = (Math.random() - 0.5) * 20; // CO2 fluctuations
                    break;
                case 'Humidity':
                    fluctuation = (Math.random() - 0.5) * 0.5; // Small humidity changes
                    break;
                default:
                    fluctuation = (Math.random() - 0.5) * 0.5; // Default fluctuation
            }
            return {
                ...sensor,
                value: Math.max(sensor.min, Math.min(sensor.max, sensor.value + fluctuation))
            };
        });
    }

    getValueColor(sensor: SensorReading): string {
        const percentage = ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;

        if (sensor.name === 'CO2') {
            if (sensor.value >= 1000) {
                return '#ff0000'; // Red for high CO2
            } else if (sensor.value >= 800) {
                return '#ffa500'; // Orange for elevated CO2
            }
        } else if (sensor.name === 'Humidity') {
            if (sensor.value >= 70 || sensor.value <= 30) {
                return '#ff0000'; // Red for extreme humidity
            } else if (sensor.value >= 65 || sensor.value <= 35) {
                return '#ffa500'; // Orange for borderline humidity
            }
        } else if (sensor.name === 'Clean Water') {
            if (percentage <= 10) {
                return '#ff0000'; // Red for very low water
            } else if (percentage <= 40) {
                return '#ffa500'; // Yellow for low water
            }
            return '#22C55E'; // Green for normal levels
        } else {
            if (percentage >= 95) {
                return '#ff0000'; // Red
            } else if (percentage >= 70) {
                return '#ffa500'; // Orange/Yellow
            }
        }
        return 'var(--primary-color)'; // Default primary color
    }

    getMoistureColor(sensor: SensorReading): string {
        const moisture = sensor.moisture || 0;

        if (moisture <= 2) {
            return '#ff0000'; // Red for critically low
        } else if (moisture <= 13.5) {
            return '#ffa500'; // Yellow for low
        } else if (moisture <= 15.5) {
            return '#22C55E'; // Green for optimal
        } else if (moisture <= 25.5) {
            return '#ffa500'; // Yellow for high
        } else {
            return '#ff0000'; // Red for too high
        }
    }

    getTemperatureColor(sensor: SensorReading): string {
        const temp = sensor.temperature || 0;
        if (temp >= 30) {
            return '#ff0000'; // Red for high temperature
        } else if (temp >= 28) {
            return '#ffa500'; // Orange for elevated temperature
        }
        return 'var(--primary-color)';
    }

    getHumidityColor(sensor: SensorReading): string {
        const humidity = sensor.humidity || 0;
        if (humidity >= 70 || humidity <= 30) {
            return '#ff0000'; // Red for extreme humidity
        } else if (humidity >= 65 || humidity <= 35) {
            return '#ffa500'; // Orange for borderline humidity
        }
        return 'var(--primary-color)';
    }

    onValveToggle(sensor: SensorReading) {
        this.messageService.add({
            severity: sensor.valveOpen ? 'success' : 'info',
            summary: `Valve ${sensor.valveOpen ? 'Opened' : 'Closed'}`,
            detail: `${sensor.name} (${sensor.location}) valve has been ${sensor.valveOpen ? 'opened' : 'closed'}`
        });

        if (!sensor.valveOpen) {
            this.simulatePressureChange(sensor, 'decrease');
            this.simulateMoistureChange(sensor, 'decrease');
        } else {
            this.simulatePressureChange(sensor, 'increase');
            this.simulateMoistureChange(sensor, 'increase');
        }
    }

    private simulatePressureChange(sensor: SensorReading, direction: 'increase' | 'decrease') {
        const interval = setInterval(() => {
            if (direction === 'decrease') {
                sensor.value = Math.max(sensor.min, sensor.value - 0.1);
                if (sensor.value <= sensor.min) {
                    clearInterval(interval);
                }
            } else {
                sensor.value = Math.min(
                    4.0, // Target normal pressure
                    sensor.value + 0.1
                );
                if (sensor.value >= 4.0) {
                    clearInterval(interval);
                }
            }
        }, 100);
    }

    private simulateMoistureChange(sensor: SensorReading, direction: 'increase' | 'decrease') {
        const interval = setInterval(() => {
            if (!sensor.moisture) return;

            if (direction === 'decrease') {
                sensor.moisture = Math.max(0, sensor.moisture - 0.5);
                if (sensor.moisture <= 0) {
                    clearInterval(interval);
                }
            } else {
                sensor.moisture = Math.min(100, sensor.moisture + 0.5);
                if (sensor.moisture >= 70) {
                    // Target moisture level
                    clearInterval(interval);
                }
            }
        }, 100);
    }

    getSystemSensor(name: string): SensorReading {
        return this.systemSensors.find((s) => s.name === name) || this.systemSensors[0];
    }

    getFilteredSystemSensors(): SensorReading[] {
        return this.systemSensors.filter((s) => !['Clean Water', 'Waste Water'].includes(s.name));
    }

    getSectionStatusMessage(sensor: SensorReading): string {
        const moisture = sensor.moisture || 0;
        const temp = sensor.temperature || 0;
        const humidity = sensor.humidity || 0;

        let messages: string[] = [];

        // Moisture status
        if (moisture <= 2) {
            messages.push('Critical: Extremely dry conditions');
        } else if (moisture <= 13.5) {
            messages.push('Warning: Moisture levels low');
        } else if (moisture <= 15.5) {
            messages.push('Optimal moisture levels');
        } else if (moisture <= 25.5) {
            messages.push('Warning: Moisture levels high');
        } else {
            messages.push('Critical: Excessive moisture');
        }

        // Temperature status
        if (temp >= 30) {
            messages.push('Temperature too high');
        } else if (temp >= 28) {
            messages.push('Temperature elevated');
        }

        // Humidity status
        if (humidity >= 70 || humidity <= 30) {
            messages.push('Humidity levels critical');
        } else if (humidity >= 65 || humidity <= 35) {
            messages.push('Humidity levels concerning');
        }

        // Valve status
        if (!sensor.valveOpen) {
            messages.push('Valve closed');
        }

        return messages.join(' • ');
    }

    getSectionStatusClass(sensor: SensorReading): string {
        const moisture = sensor.moisture || 0;
        const temp = sensor.temperature || 0;
        const humidity = sensor.humidity || 0;

        // Critical conditions
        if (moisture <= 2 || moisture > 25.5 || temp >= 30 || humidity >= 70 || humidity <= 30) {
            return 'bg-red-100 text-red-800';
        }

        // Warning conditions
        if (moisture <= 13.5 || (moisture > 15.5 && moisture <= 25.5) || temp >= 28 || humidity >= 65 || humidity <= 35) {
            return 'bg-yellow-100 text-yellow-800';
        }

        // Optimal conditions
        return 'bg-green-100 text-green-800';
    }

    getGlobalStatusText(): string {
        const alertCount = this.getAlertsCount();
        if (alertCount > 0) return 'Critical';
        if (this.getWarningsCount() > 0) return 'Warning';
        return 'Normal';
    }

    getGlobalStatusClass(): string {
        const status = this.getGlobalStatusText();
        switch (status) {
            case 'Critical':
                return 'bg-red-100 text-red-800';
            case 'Warning':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    }

    getActiveSectors(): number {
        return this.pressureSensors.filter((sensor) => sensor.valveOpen).length;
    }

    getOpenValvesCount(): number {
        return this.getActiveSectors();
    }

    getAlertsCount(): number {
        return this.pressureSensors.filter((sensor) => {
            const moisture = sensor.moisture || 0;
            const temp = sensor.temperature || 0;
            const humidity = sensor.humidity || 0;
            return moisture <= 2 || moisture > 25.5 || temp >= 30 || humidity >= 70 || humidity <= 30;
        }).length;
    }

    getWarningsCount(): number {
        return this.pressureSensors.filter((sensor) => {
            const moisture = sensor.moisture || 0;
            const temp = sensor.temperature || 0;
            const humidity = sensor.humidity || 0;
            return (moisture <= 13.5 || (moisture > 15.5 && moisture <= 25.5) || temp >= 28 || humidity >= 65 || humidity <= 35) && !(moisture <= 2 || moisture > 25.5 || temp >= 30 || humidity >= 70 || humidity <= 30);
        }).length;
    }

    getGlobalStatusMessage(): string {
        const messages: string[] = [];
        const alertCount = this.getAlertsCount();
        const warningCount = this.getWarningsCount();
        const activeCount = this.getActiveSectors();

        if (alertCount > 0) {
            messages.push(`${alertCount} sector${alertCount > 1 ? 's' : ''} requiring immediate attention`);
        }
        if (warningCount > 0) {
            messages.push(`${warningCount} sector${warningCount > 1 ? 's' : ''} with warnings`);
        }
        messages.push(`${activeCount} active sector${activeCount !== 1 ? 's' : ''} out of ${this.sectotrs}`);

        if (alertCount === 0 && warningCount === 0) {
            messages.push('All systems operating within normal parameters');
        }

        return messages.join(' • ');
    }

    private checkCriticalStatus(sensor: SensorReading) {
        const moisture = sensor.moisture || 0;
        const temp = sensor.temperature || 0;
        const humidity = sensor.humidity || 0;

        if (moisture <= 2) {
            this.messageService.add({
                severity: 'error',
                summary: 'Critical: Extremely Low Moisture',
                detail: `${sensor.name} (${sensor.location}) moisture level is critically low at ${moisture.toFixed(1)}%`
            });
        } else if (moisture > 25.5) {
            this.messageService.add({
                severity: 'error',
                summary: 'Critical: Excessive Moisture',
                detail: `${sensor.name} (${sensor.location}) moisture level is too high at ${moisture.toFixed(1)}%`
            });
        }

        if (temp >= 30) {
            this.messageService.add({
                severity: 'error',
                summary: 'Critical: High Temperature',
                detail: `${sensor.name} (${sensor.location}) temperature is too high at ${temp.toFixed(1)}°C`
            });
        }

        if (humidity >= 70 || humidity <= 30) {
            this.messageService.add({
                severity: 'error',
                summary: 'Critical: Humidity Level',
                detail: `${sensor.name} (${sensor.location}) humidity is ${humidity <= 30 ? 'too low' : 'too high'} at ${humidity.toFixed(1)}%`
            });
        }
    }
}

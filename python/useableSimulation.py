# Libary Importations
import numpy as np
import simpy
import math
import time

sampleRate = 0

def step(magnitude, time, delay, initial):
    
    if time > delay:
        x = magnitude
    else:
        x = initial
        
    return x


# Parameters for Reactor Power
reactorVolume = 937.77        # ft^3
F = 3.033e-14                 # BTU
Sigmaf = 0.01819
neutronVelocity = 6500
N = 5e22

# Core parameter Models
fuel_mass = 53850.5
mass_core = 6898.3 

# Heat Transfer Areas in the Nuclear Reactor
Afc = 14120.6       # ft^2
Afc1 = 7060.3       # ft^2
Afc2 = 7060.3       # ft^2

# Heat Capacities
cpc = 1.376         # BTU/lbm-F
cpf = 0.059         # BTU/lbm-F

# Fraction of Total Power Deposited in Fuel
fp = 0.97

# Coolant Mass in Nodes
mc1 = 3449.1        # lbm
mc2 = 3449.1        # lbm

# Overall Heat Transfer Coefficient
Ufc = 0.090944      # BTU/s-ft^2-F

# Core Flow
Wc = 8333.3         # lbm/s

# Uranium-235
beta = 0.0067; beta1 = 2.21e-4; beta2 = 1.1467e-3; beta3 = 1.001313e-03; beta4 = 2.647e-03; beta5 = 7.71e-4; beta6 = 2.814e-4

# Decay Constant, lami (s^-1)
lam1 = 0.0124; lam2 = 0.0305; lam3 = 0.111; lam4 = 0.301; lam5 = 1.14; lam6 = 3.01

# Mean Prompt Time
MPT = 1.79e-4 # seconds 

# Nominal Temps (Farenheit)
theta1o = 586.3; theta2o = 608.0; Tfuelo = 973.061; Tavgo = 588.5

# Nominal Power 
Po = 502343.1      # BTU/s
no = 5e13
ratedPower = 61    # rated electric power at full load

# reactivity coeffs
ac = -0.0002       # 1/F 
af = -0.165e-5     # 1/F

# Controller Parameters
Kp = -6.7e-5
Ki = -6.7e-6

# Coeffiecents of the OTSG 
Kb = -0.000053
K1 = 8.02299324e-04
Ksc = -0.000053

# Steam Generator Design Parameters
As = 13.18
Awsc = 2247.22

# Specific Heat Capacities
cpfw = 1.122
cpp = 1.37661
cpsc = 1.128
cpw = 0.109
cps = 0.762

# Diameters
Dit = 4.642e-02     # ft
Dot = 5.208e-02     # ft
Dis = 3.5           # ft
Dos = 6.84          # ft


# Heat of Vaporization
hfg = 664.9

# heat transfer
hpw = 1.807         # BTU/s-ft^2-F
hwb = 2.16647       # BTU/s-ft^2-F
hws = 0.6672        # BTU/s-ft^2-F
hwsc = 1.18         # BTU/s-ft^2-F

# densities
pb = 45.14          # boiling fluid density # lbm/ft^3 
pf = 45.138         # boiling density       # lbm/ft^3 
pfw = 53.47         # feedwater density     # lbm/ft^3 
pp = 44.75          # primary fluid density # lbm/ft^3 
ps = 1.15358        # steam density         # lbm/ft^3 
psc = 50.76         # subcooled fluid density # lbm/ft^3 
pw = 526            # inconel 690 density   # lbm/ft^3 

# Lengths
L = 28              # active SG tube length # ft
Lb = 19.9302        # boiling length        # ft
Ls = 3.85776        # steam length          # ft
Lsc = 4.21202       # subcooled length      # ft

Mstm = 18           # Molar weight of Steam # lbm/lbmol
N = 6446            # Number of Tubes
R = 10.71316        # Universal Gas Constant # [ft^3-psia/R-lbmol]

# Flow Rates
Wc = 8333           # lbm/s           
Ws = 504.059        # lbm/s
Wfw = 504.059       # lbm/s

Zss = 0.8313       # Steam Expansion Coefficient 

# Secondary Side
Tsat = 599.079
Tfw = 414

ts = 1
Wso = 504.058
Pset = 825
Ps = 825
Cst = 10
kc = 5

Apw1= 180.089
Apw3 = 930.386
Apw5 = 196.627

Mp1 = 9.149
Mp3 = 47.266
Mp5 = 9.989

Aws1 = 658.848
Aws3 = 3403.782
Aws5 = 719.350
 
Mw1 = 225519.860
Mw3 = 1165094.750
Mw5 = 246229.460

def rho_ext(position):
    rho_ext = (-1.0e-5)*position + (-1.5e-5)*(position)
    return rho_ext


def reactor_core(env, interval):
    
    while True:
        global xCurrent
        c1 = open("/home/ubuntu/Desktop/coolantPump.txt", "r")
        coolantPump = float(c1.read())

        c2 = open("/home/ubuntu/Desktop/steamDemand.txt", "r")
        steamDemand = float(c2.read())
       
        c3 = open("/home/ubuntu/Desktop/feedwaterPump.txt", "r")
        feedwaterPump = float(c3.read())

        c4 = open("/home/ubuntu/Desktop/tavgController.txt","r")
        Tavgo = float(c4.read())

        c5 = open("/home/ubuntu/Desktop/controlRod.txt","r")
        ControlRodPosition = float(c5.read())
        
       
        #assigning their states to a columns in the matrix 
        t = env.now
    
        n = xCurrent[0]                 # A in Excel, neutron density
        C1 = xCurrent[1]                # B in Excel, neutron group 1
        C2 = xCurrent[2]                # C in Excel, neutron group 2
        C3 = xCurrent[3]                # D in Excel, neutron group 3
        C4 = xCurrent[4]                # E in Excel, neutron group 4
        C5 = xCurrent[5]                # F in Excel, neutron group 5
        C6 = xCurrent[6]                # G in Excel, neutron group 6
        k = xCurrent[7]                 # H in Excel, error term, Tavg - Taverage reference
        Tfuel = xCurrent[8]             # I in Excel, temperature of the feul in Farenheit
        theta1 = xCurrent[9]            # J in Excel, temperature of the coolant node(cold, into node 2) 1 in Farenheit
        theta2 = xCurrent[10]           # K in Excel, temperature of the coolant node 2 (hot, into OTSG) in Farenheit

        Tp1 = xCurrent[11]              # L in Excel, temperature in primary node 1  
        Tp2 = xCurrent[12]              # M in Excel, temperature in primary node 2  
        Tp3 = xCurrent[13]              # N in Excel, temperature in primary node 3  
        Tp4 = xCurrent[14]              # O in Excel, temperature in primary node 4 
        Tp5 = xCurrent[15]              # P in Excel, temperature in primary node 5 
        Tp6 = xCurrent[16]              # Q in Excel, temperature in primary node 6, going into Nuclear reactor, Cold Leg
        Tw1 = xCurrent[17]              # R in Excel, temperature in wall node 1  
        Tw2 = xCurrent[18]              # S in Excel, temperature in wall node 2 
        Tw3 = xCurrent[19]              # T in Excel, temperature in wall node 3   
        Tw4 = xCurrent[20]              # U in Excel, temperature in wall node 4 
        Tw5 = xCurrent[21]              # V in Excel, temperature in wall node 5 
        Tw6 = xCurrent[22]              # W in Excel, temperature in wall node 6 

        Ts1 = xCurrent[23]             # X in Excel, temperature of the superheated node 1 
        Ts2 = xCurrent[24]             # Y in Excel, temperature of the superheated node 2
        Torque = xCurrent[25]          # Z in Excel, torque of the turbine (lbf-ft)
        Powerp = xCurrent[26]          # AA in Excel, Power from past time step
        percentPower = xCurrent[27]    # AB in Excel, percentage fo power in the system before rated power
        Psat = xCurrent[28]            # AC in Excel, saturation Pressure (in this model it is assumed to be constant)
        Tsc = xCurrent[29]             # AD in Excel,  Subcooled Temperature in Farenheit
        P = xCurrent[30]               # AE in Excel, Reactor Power Thermal

        thetaAvg = (Tp6 + theta2)/2  # Average temperature in the coolant nodes
                                   
        # Coolant Flow
        Wc = coolantPump

        # Steam Flow
        Ws = steamDemand
   
        rho_c = Kp*(Tavgo - thetaAvg) + Ki*(k)
        rhoExt = rho_ext(ControlRodPosition)
        rho = af*Tfuel + ac*0.5*theta1 + ac*0.5*theta2 + beta*rho_c + rhoExt

        dndt  = ((rho-beta)/MPT)*n + C1*lam1 + C2*lam2 + C3*lam3 + C4*lam4 + C5*lam5 + C6*lam6
        dc1dt = (beta1/MPT)*(n) - lam1*C1
        dc2dt = (beta2/MPT)*(n) - lam2*C2
        dc3dt = (beta3/MPT)*(n) - lam3*C3
        dc4dt = (beta4/MPT)*(n) - lam4*C4
        dc5dt = (beta5/MPT)*(n) - lam5*C5
        dc6dt = (beta6/MPT)*(n) - lam6*C6

        C11 = F*reactorVolume*C1
        C22 = F*reactorVolume*C2
        C33 = F*reactorVolume*C3
        C44 = F*reactorVolume*C4
        C55 = F*reactorVolume*C5
        C66 = F*reactorVolume*C6
        
        #dPdt =  ((rho-beta)/MPT)*P + C11*lam1 + C22*lam2 + C33*lam3 + C44*lam4 + C55*lam5 + C66*lam6
        dPdt =  reactorVolume*Sigmaf*neutronVelocity*F*n
        dkdt = Tavgo - thetaAvg
        dTfuel =  (fp*P + (Ufc*Afc)*(theta1 - Tfuel))/(fuel_mass*cpf)
        dtheta1 = (0.5*(1-fp)*P + (Ufc*Afc1)*(Tfuel - theta1) + Wc*cpc*(Tp6 - theta1))/(mc1*cpc)
        dtheta2 = (0.5*(1-fp)*P + (Ufc*Afc2)*(Tfuel - theta1) + Wc*cpc*(theta1 - theta2))/(mc2*cpc)

        #Turbine 
        speed = 30 #rev per second
        PowerBTU = (speed*Torque)/778.16    # BTUs
        Power = PowerBTU*(0.001055056)     # MegaWatts
        dTq = (-1/10)*Torque + (1/10)*Ws*(2748)

        # Power
        changePower = Power - Powerp
        percentPower = (Power/ratedPower)*100
        decimalPower = Power/ratedPower

        # Change in Length
        dLsc = 0.1179
        dLb = 0.0033
        dLs = -0.0034

        # Feedwater Flow from BOP
        Wfw = feedwaterPump

        if Wfw > Ws:
            Wsc = Wfw + 0.5*dLsc*As*psc
            Wdb = Wsc + 0.5*dLsc*As*psc
            Wb = Wdb + dLsc*As*pb
            W12 = Wb + 0.5*dLs*As*ps
            Ws = W12 + 0.5*dLs*As*ps
        else:  
            W12 = Ws - 0.5*dLs*As*ps
            Wb = W12 - 0.5*dLs*As*ps
            Wdb = Wb - dLsc*As*pb
            Wsc = Wdb - 0.5*dLsc*As*psc
            Wfw = Wsc - 0.5*dLsc*As*psc
       

        # Subcooled Region
        Lsc = 0.1179*(decimalPower) + 2.5617

        # Boiling Region
        Lb = 0.0033*(decimalPower)**2 + 0.2768*(decimalPower) + 8.517

        # Superheated Region 
        Ls = -0.0034*(decimalPower)**2 - 0.4057*(decimalPower) + 89.128

        # Subcooled Pressure 
        dPsc = (Wfw - Wdb - psc*As*dLsc)/(As*Ls*Ksc)

        # Steam Pressure 
        dPS = (Zss*(Wb - Ws)*R*((Ts1+458.67+Ts2+458.67)/(2*Mstm)))/(As*Ls)

        # Feedwater Temperature
        #dPsat = (hwsc*Awsc*(Tw5 - Tsat) + 2*cpsc*(Wsc*Tsc - Wdb*Tsat) - As*psc*cpsc*(Tsat*dLsc))/(As*psc*cpsc*K1*Lsc)
        dPsat = 0.00
  
        # Primary Side
        dTp1 = (Wc*cpp*(theta2 - Tp1) - hpw*Apw1*(Tp1 - Tw1))/(Mp1*cpp)
        dTp2 = (Wc*cpp*(Tp1 - Tp2) - hpw*Apw1*(Tp2 - Tw2))/(Mp1*cpp)
        dTp3 = (Wc*cpp*(Tp2 - Tp3) - hpw*Apw3*(Tp3 - Tw3))/(Mp3*cpp)
        dTp4 = (Wc*cpp*(Tp3 - Tp4) - hpw*Apw3*(Tp4 - Tw4))/(Mp3*cpp)
        dTp5 = (Wc*cpp*(Tp4 - Tp5) - hpw*Apw5*(Tp5 - Tw5))/(Mp5*cpp)
        dTp6 = (Wc*cpp*(Tp5 - Tp6) - hpw*Apw5*(Tp6 - Tw6))/(Mp5*cpp)
        
        # Wall Temps
        dTw1 = (hpw*Apw1*(Tp1 - Tw1) - hws*Aws1*(Tw1 - Ts1))/(Mw1*cpw)
        dTw2 = (hpw*Apw1*(Tp2 - Tw2) - hws*Aws1*(Tw2 - Ts2))/(Mw1*cpw)
        dTw3 = (hpw*Apw3*(Tp3 - Tw3) - hws*Aws3*(Tw3 - Tsat))/(Mw3*cpw)
        dTw4 = (hpw*Apw3*(Tp4 - Tw4) - hws*Aws3*(Tw4 - Tsat))/(Mw3*cpw)
        dTw5 = (hpw*Apw5*(Tp5 - Tw5) - hws*Aws5*(Tw5 - Tsc))/(Mw5*cpw)
        dTw6 = (hpw*Apw5*(Tp6 - Tw6) - hws*Aws5*(Tw6 - Tsc))/(Mw5*cpw)

        dTs1 = (hws*Aws1*(Tw1 - Ts1) - (Ws*cps*(Ts1 - Ts2)))/(As*0.5*Ls*ps*cps)
        dTs2 = (hws*Aws1*(Tw2 - Ts2) - (Ws*cps*(Ts2 - Tsat)))/(As*0.5*Ls*ps*cps)

        dTsc = (hwsc*(math.pi)*Dot*0.5*Lsc*(Tw6-Tfw) + cpsc*(Wfw*Tfw - Wsc*Tsc) + (1/778)*0.5*As*Lsc*dPsc - 0.5*Tfw*dLsc*As*psc*cpsc)/((0.5*Lsc*As*psc*cpsc))

        xPrime = [dndt, dc1dt, dc2dt, dc3dt, dc4dt, dc5dt, dc6dt, dkdt, dTfuel, dtheta1, dtheta2, dTp1, dTp2, dTp3, dTp4, dTp5, dTp6,dTw1, dTw2, dTw3, dTw4, dTw5, dTw6, dTs1, dTs2, dTq, Power, percentPower,dPsat, dTsc,dPdt]
       
        xMid = [    xCurrent[0] + interval * xPrime[0],
                    xCurrent[1] + interval * xPrime[1],
                    xCurrent[2] + interval * xPrime[2],
                    xCurrent[3] + interval * xPrime[3],
                    xCurrent[4] + interval * xPrime[4],
                    xCurrent[5] + interval * xPrime[5],
                    xCurrent[6] + interval * xPrime[6],
                    xCurrent[7] + interval * xPrime[7],
                    xCurrent[8] + interval * xPrime[8],
                    xCurrent[9] + interval * xPrime[9],
                    xCurrent[10] + interval * xPrime[10],                   
                    xCurrent[11] + interval * xPrime[11],
                    xCurrent[12] + interval * xPrime[12],
                    xCurrent[13] + interval * xPrime[13],
                    xCurrent[14] + interval * xPrime[14],
                    xCurrent[15] + interval * xPrime[15],
                    xCurrent[16] + interval * xPrime[16],
                    xCurrent[17] + interval * xPrime[17],
                    xCurrent[18] + interval * xPrime[18],
                    xCurrent[19] + interval * xPrime[19],                                    
                    xCurrent[20] + interval * xPrime[20],
                    xCurrent[21] + interval * xPrime[21],
                    xCurrent[22] + interval * xPrime[22],
                    xCurrent[23] + interval * xPrime[23],
                    xCurrent[24] + interval * xPrime[24],
                    xCurrent[25] + interval * xPrime[25],
                    xPrime[26],
                    xPrime[27],
                    xCurrent[28] + interval * xPrime[28],
                    xCurrent[29] + interval * xPrime[29],
                    xPrime[30],
                ]
                   
            
        xCurrent = xMid    
        # print(xMid)

        global sampleRate
        if sampleRate <= 200:
            sampleRate += 1  
        else:
            sampleRate = 0            
            sample = np.array(xCurrent)
            sample = np.append(sample, int(time.time_ns()))
            sample.tofile('/var/www/html/sample.csv', sep=",")

        yield env.timeout(interval) 
        

if __name__ == '__main__':
    xCurrent = [no, beta1/(lam1*MPT), beta2/(lam2*MPT), beta3/(lam3*MPT), beta4/(lam4*MPT), beta5/(lam5*MPT), beta6/(lam6*MPT),0,973.061,567,608,610.331,609.129,585.995,573.554,571.845,566.3,609.06,604.985,570.556,565.251,566.446,548.789,605.992,594.981,0,0,0,1136.58,550,Po] 
    env = simpy.rt.RealtimeEnvironment(strict=False)
    proc = env.process(reactor_core(env,0.001))
    
    env.run(until=proc)
#%%

# Libary Importations
import numpy as np
import simpy
import math


def step(magnitude, time, delay, initial):
    
    if time > delay:
        x = magnitude
    else:
        x = initial
        
    return x

# Core parameter Models

fuel_mass = 53850.5
mass_core = 6898.3 
Afc = 14120.6
Afc1 = 7060.3
Afc2 = 7060.3
cpc = 1.376
cpf = 0.059
f = 0.97
mc1 = 3449.1
mc2 = 3449.1
Tf = 962.672
Tfo = 962.741
Ufc = 0.0909
Wc = 8333.3

# Uranium-235
beta = 0.0067
beta1 = 2.21e-4
beta2 = 1.1467e-3
beta3 = 1.001313e-03
beta4 = 2.647e-03
beta5 = 7.71e-4
beta6 = 2.814e-4

# Decay Constant, lami (s^-1)
lam1 = 0.0124
lam2 = 0.0305
lam3 = 0.111
lam4 = 0.301
lam5 = 1.14
lam6 = 3.01

MPT = 1.79e-4 # seconds mean prompt time

# Nominal Temps (Farenheit)
theta1o = 586.3
theta2o = 608.0
Tfuelo = 608.0

# Nominal Power 
Po = 502343 #BTU/s
no = 3450
ratedPower = 181   # rated electric power at full load

# reactivity coeffs
ac = -0.0002
af = -0.165e-5

# Controller Parameters
K = 1
Kp = 0.1
Ki = 0.01



# Coeffiecents of the OTSG 
Kb = -0.000053
K1 = 8.02299324e-04
Ksc = -0.000053

# Steam Generator Design Parameters
As = 13.18
Awsc = 2247.22

# heat capacities
cpfw = 1.122
cpp = 1.37661
cpsc = 1.128
cpw = 0.109
cps = 0.762

# Diameters
Dit = 4.642e-02
Dot = 5.208e-02
Dis = 3.5
Dos = 6.84

# heat transfer
hfg = 664.9
hpw = 1.807
hwb = 2.16647
hws = 0.6672
hwsc = 1.18

# densities
pb = 45.14
pf = 45.138
pfw = 53.47
pp = 44.75
ps = 1.15358
psc = 50.76
pw = 526

# Lengths
L = 28
Lb = 19.9302
Ls = 3.85776
Lsc = 4.21202

Mstm = 18
N = 6446
R = 10.71316

# Flow Rates
Wc = 8333
Ws = 504.059
Wfw = 504.059

Zss = 0.8313

# Secondary Side
Tsat = 599.079
Tfw = 250

cpw = 2.4
hws = 12
hwb = 12
hwsc = 12

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

def reactor_core(env, interval):
    
    while True:
        global xCurrent
       
        f = 0.974
        #assigning their states to a columns in the matrix 
       
        t = env.now
    
        n = xCurrent[0]                 # A
        C1 = xCurrent[1]                # B
        C2 = xCurrent[2]                # C
        C3 = xCurrent[3]                # D
        C4 = xCurrent[4]                # E
        C5 = xCurrent[5]                # F
        C6 = xCurrent[6]            
        k = xCurrent[7]
        Tfuel = xCurrent[8]
        theta1 = xCurrent[9]
        theta2 = xCurrent[10]

        Tp1 = xCurrent[11]             # temperature in primary node 1  
        Tp2 = xCurrent[12]             # temperature in primary node 2  
        Tp3 = xCurrent[13]             # temperature in primary node 3  
        Tp4 = xCurrent[14]             # temperature in primary node 4 
        Tp5 = xCurrent[15]             # temperature in primary node 5 
        Tp6 = xCurrent[16]             # temperature in primary node 6, going into Nuclear reactor, Cold Leg
        Tw1 = xCurrent[17]             # temperature in wall node 1  
        Tw2 = xCurrent[18]             # temperature in wall node 2 
        Tw3 = xCurrent[19]             # temperature in wall node 3   
        Tw4 = xCurrent[20]             # temperature in wall node 4 
        Tw5 = xCurrent[21]             # temperature in wall node 5 
        Tw6 = xCurrent[22]             # temperature in wall node 6 

        Ts1 = xCurrent[23]
        Ts2 = xCurrent[24]
        Torque = xCurrent[25]
        Powerp = xCurrent[26]
        percentPower = xCurrent[27]
        Psat = xCurrent[28]
        Tsat1 = xCurrent[29]
        Tsc1 = xCurrent[30]

        thetaAvg = (theta1 + theta2)/2
        Tavgo = 547 
        Tinlet = 400
        
        Wc = step(9000,t,10,8333)
   
        # rho_c = Kp*(Tavgo - thetaAvg) + Ki*(k)
        rho = af*(Tfuel - Tfuelo) + 0.5*ac*(theta1 - theta1o) + 0.5*ac*(theta2 - theta2o) + Kp*(Tavgo - thetaAvg) + Ki*(k)

        dndt =  (rho/MPT) - (beta/MPT)*n + C1*lam1 + C2*lam2 + C3*lam3 + C4*lam4 + C5*lam5 + C6*lam6
        dc1dt = (beta1/MPT)*(n) - lam1*C1
        dc2dt = (beta2/MPT)*(n) - lam2*C2
        dc3dt = (beta3/MPT)*(n) - lam3*C3
        dc4dt = (beta4/MPT)*(n) - lam4*C4
        dc5dt = (beta5/MPT)*(n) - lam5*C5
        dc6dt = (beta6/MPT)*(n) - lam6*C6
        dkdt = Tavgo - thetaAvg
        dTfuel = (f*Po*n + (Ufc*Afc)*(Tfuel - thetaAvg))/(fuel_mass*cpf)
        dtheta1 = (Wc*cpc*(Tp6 - theta1) + ((Ufc*Afc)/2)*(Tfuel - theta1) + (1-f)*Po*n)/(mass_core*cpc)
        dtheta2 = (Wc*cpc*(theta1 - theta2) + ((Ufc*Afc)/2)*(Tfuel - theta1) + (1-f)*Po*n)/(mass_core*cpc)

        #Ts1 = 605.992
        #Ts2 = 594.981
        Tsc = 524.892
        Tsat = 559.079

        #Turbine 
        speed = 30 #rev per second
        PowerBTU = (speed*Torque)/778.16    # BTUs
        Power = PowerBTU*(0.001055056)     # MegaWatts
        dTq = (-1/10)*Torque + (1/10)*Ws*(2748)
        changePower = Power - Powerp
        percentPower = (Power/ratedPower)*100
        decimalPower = Power/ratedPower


        dLsc = 0.1179
        dLb = 0.0033
        dLs = -0.0034

        W12 = Ws - 0.5*dLs*As*ps
        Wb = W12 - 0.5*dLs*As*ps
        Wdb = Wb - dLsc*As*pb
        Wsc = Wdb - 0.5*dLsc*As*psc

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
        dPsat = (hwsc*Awsc*(Tw5 - Tsat) + 2*cpsc*(Wsc*Tsc - Wdb*Tsat) - As*psc*cpsc*(Tsat*dLsc))/(As*psc*cpsc*K1*Lsc)

        Tsat1 = 98.645*(np.abs(Psat))**(1/4)

                
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

        dTsc = (hwsc*(math.pi)*Dot*0.5*Lsc*(Tw6-Tfw) + cpsc*(Wfw*Tfw - Wsc*Tsc1) + (1/778)*0.5*As*Lsc*dPsc - 0.5*Tfw*dLsc*As*psc*cpsc)/((0.5*Lsc*As*psc*cpsc))


        xPrime = [dndt, dc1dt, dc2dt, dc3dt, dc4dt, dc5dt, dc6dt, dkdt, dTfuel, dtheta1, dtheta2, dTp1, dTp2, dTp3, dTp4, dTp5, dTp6,dTw1, dTw2, dTw3, dTw4, dTw5, dTw6, dTs1, dTs2, dTq, Power, percentPower,dPsat, Tsat1, dTsc]
       
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
                    xPrime[29],
                    xCurrent[30] + interval * xPrime[30],
                ]
                   
            
        xCurrent = xMid    
        print(xMid)

               
        #f = open("ReactorTest.csv", "a")
        #f.write(str(xCurrent).replace("[", "").replace("]", ""))
        #f.write("\n")
        #f.close()
        
        yield env.timeout(interval) 
        

if __name__ == '__main__':
    
    xCurrent = [1, beta1/(lam1*MPT), beta2/(lam2*MPT), beta3/(lam3*MPT), beta4/(lam4*MPT), beta5/(lam5*MPT), beta6/(lam6*MPT),0,973.061,567,608,610.331,609.129,585.995,573.554,571.845,566.3,609.06,604.985,570.556,565.251,566.446,548.789,605.992,594.981,0,0,0,0,559.079,550] 
    env = simpy.rt.RealtimeEnvironment(strict=False)
    proc = env.process(reactor_core(env,0.001))
    
    env.run(until=proc)

#%%